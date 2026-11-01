import pytest
import datetime
from fastapi.testclient import TestClient
import sys
import os

# Add backend to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
from app.database import Base, engine

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_unauthenticated_workspace_profile():
    # In unauthenticated mode, /api/auth/me succeeds with 200 and returns default workspace user
    resp = client.get("/api/auth/me")
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "alex.morgan@resumate.ai"
    assert data["full_name"] == "yaswanth"

def test_unauthenticated_endpoints_no_headers():
    # Application endpoints do not require Authorization headers and return 200
    resp = client.get("/api/resumes")
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

    resp2 = client.get("/api/cover-letters")
    assert resp2.status_code == 200
    assert isinstance(resp2.json(), list)

    resp3 = client.get("/api/career/applications")
    assert resp3.status_code == 200
    assert isinstance(resp3.json(), list)

def test_workspace_profile_update():
    # Update profile in workspace without tokens
    up_resp = client.put("/api/auth/profile", json={
        "headline": "Lead Full-Stack Architect",
        "theme_preference": "dark"
    })
    assert up_resp.status_code == 200
    assert up_resp.json()["headline"] == "Lead Full-Stack Architect"

def test_templates_and_account_data():
    # Templates catalog and account data export work without login
    tpl = client.get("/api/templates")
    assert tpl.status_code == 200
    assert len(tpl.json()) >= 6

    acc = client.get("/api/export/account-data")
    assert acc.status_code == 200
    assert "user" in acc.json()
    assert "resumes" in acc.json()

def test_unauthenticated_full_lifecycle():
    ts = datetime.datetime.now().timestamp()
    test_email = f"lifecycle_{ts}@resumate.ai"

    # 1. Resumes list without auth headers
    list_resp = client.get("/api/resumes")
    assert list_resp.status_code == 200
    assert isinstance(list_resp.json(), list)

    # 2. Create resume without auth headers
    create_resp = client.post("/api/resumes", json={
        "title": "Jane Senior Engineer",
        "template_id": "ats_classic",
        "target_role": "Staff Backend Engineer",
        "content": {
            "personal_info": {
                "full_name": "Jane Developer",
                "headline": "Staff Backend Engineer",
                "email": test_email,
                "phone": "+1 (555) 012-3456",
                "location": "Seattle, WA",
                "linkedin": "https://linkedin.com/in/janedev",
                "github": "https://github.com/janedev"
            },
            "summary": "Accomplished Backend Engineer with 7+ years of experience architecting high-throughput distributed microservices in Python and PostgreSQL.",
            "experience": [
                {
                    "id": "exp-1",
                    "company": "ScaleCloud Systems",
                    "role": "Staff Software Engineer",
                    "location": "Seattle, WA",
                    "start_date": "2021-03",
                    "end_date": "Present",
                    "current": True,
                    "bullets": [
                        "Architected distributed event-driven payment processing engine handling 80,000 requests per second.",
                        "Reduced P99 API response latency by 42% through query optimization, Redis caching, and connection pooling."
                    ],
                    "technologies": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker"]
                }
            ],
            "skills": [
                {"id": "s-1", "name": "Backend", "skills": ["Python", "FastAPI", "PostgreSQL", "Redis", "Docker", "AWS"]}
            ],
            "education": [
                {
                    "id": "e-1",
                    "institution": "University of Washington",
                    "degree": "Bachelor of Science",
                    "field_of_study": "Computer Science",
                    "start_date": "2013-09",
                    "graduation_date": "2017-06"
                }
            ]
        }
    })
    assert create_resp.status_code == 200
    created_resume = create_resp.json()
    resume_id = created_resume["id"]
    assert created_resume["title"] == "Jane Senior Engineer"
    assert created_resume["ats_score"] > 70

    # 3. Read resume by id without auth headers
    get_resp = client.get(f"/api/resumes/{resume_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == resume_id

    # 4. Update resume without auth headers
    update_resp = client.put(f"/api/resumes/{resume_id}", json={
        "title": "Jane Developer - Principal Resume",
        "target_role": "Principal Systems Architect"
    })
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Jane Developer - Principal Resume"

    # 5. Check ATS analyzer without auth headers
    ats_resp = client.get(f"/api/ats/analyze/{resume_id}")
    assert ats_resp.status_code == 200
    ats_data = ats_resp.json()
    assert ats_data["score"] >= 70
    assert ats_data["passed_checks"] > 0
    assert "summary_feedback" in ats_data

    # 6. Job Matcher without auth headers
    match_resp = client.post("/api/job-match/analyze", json={
        "resume_id": resume_id,
        "job_title": "Principal Backend Architect",
        "company": "HyperScale Cloud",
        "job_description": "We are seeking a Principal Backend Architect with deep expertise in Python, FastAPI, PostgreSQL, Redis, and distributed systems."
    })
    assert match_resp.status_code == 200
    match_res = match_resp.json()
    assert match_res["match_score"] >= 60
    assert "Python" in match_res["matching_skills"] or "Fastapi" in match_res["matching_skills"]

    # 7. Check job match history persistence without auth headers
    hist_resp = client.get("/api/job-match/history")
    assert hist_resp.status_code == 200
    assert len(hist_resp.json()) >= 1
    match_id = hist_resp.json()[0]["id"]

    # Delete match history item without auth headers
    del_hist = client.delete(f"/api/job-match/history/{match_id}")
    assert del_hist.status_code == 200

    # 8. Cover Letter builder without auth headers
    cl_resp = client.post("/api/cover-letters", json={
        "title": "Cover Letter - HyperScale Cloud",
        "company_name": "HyperScale Cloud",
        "job_title": "Principal Backend Architect",
        "resume_id": resume_id
    })
    assert cl_resp.status_code == 200
    cl_data = cl_resp.json()
    assert "HyperScale Cloud" in cl_data["content"]
    cl_id = cl_data["id"]

    # List cover letters without auth headers
    cl_list = client.get("/api/cover-letters")
    assert cl_list.status_code == 200
    assert len(cl_list.json()) >= 1

    # Delete cover letter without auth headers
    del_cl = client.delete(f"/api/cover-letters/{cl_id}")
    assert del_cl.status_code == 200

    # 9. Job Application Tracker without auth headers
    app_resp = client.post("/api/career/applications", json={
        "company": "HyperScale Cloud",
        "job_title": "Principal Backend Architect",
        "status": "applied",
        "location": "Seattle, WA",
        "salary_range": "$220,000 - $260,000",
        "resume_id": resume_id,
        "notes": "Applied via referral"
    })
    assert app_resp.status_code == 200
    app_id = app_resp.json()["id"]

    # Update application status without auth headers
    up_app = client.put(f"/api/career/applications/{app_id}", json={
        "status": "interviewing"
    })
    assert up_app.status_code == 200
    assert up_app.json()["status"] == "interviewing"

    # List applications without auth headers
    app_list = client.get("/api/career/applications")
    assert app_list.status_code == 200
    assert len(app_list.json()) >= 1

    # Delete application without auth headers
    del_app = client.delete(f"/api/career/applications/{app_id}")
    assert del_app.status_code == 200

    # 10. AI Status & Services
    ai_status = client.get("/api/ai/status")
    assert ai_status.status_code == 200
    assert ai_status.json()["status"] == "ready"

    # AI Summary Improvement
    ai_sum = client.post("/api/ai/improve-summary", json={
        "current_summary": "I worked on APIs and assisted with the database.",
        "target_role": "Backend Engineer"
    })
    assert ai_sum.status_code == 200
    assert len(ai_sum.json()["improved"]) > 20

    # AI Bullets Enhancement
    ai_bullets = client.post("/api/ai/enhance-bullets", json={
        "bullet_points": ["helped with the database migration", "worked on user login"]
    })
    assert ai_bullets.status_code == 200
    assert len(ai_bullets.json()) == 2

    # AI Skills Suggestion
    ai_skills = client.post("/api/ai/suggest-skills", json={
        "target_role": "Backend Engineer",
        "current_skills": ["Python"]
    })
    assert ai_skills.status_code == 200
    skills_list = ai_skills.json()
    assert len(skills_list) > 0
    skills_lower = [s.lower() for s in skills_list]
    assert any(k in skills_lower for k in ["fastapi", "postgresql", "sql", "docker", "kubernetes", "go", "java"])

    # AI Grammar Check
    ai_grammar = client.post("/api/ai/grammar-check", json={
        "text": "I worked on teh goverment project and recieve awards."
    })
    assert ai_grammar.status_code == 200
    assert "government" in ai_grammar.json()["improved"].lower()
    assert "recieve" not in ai_grammar.json()["improved"].lower()
    assert "goverment" not in ai_grammar.json()["improved"].lower()

    # 11. DOCX Export without auth headers
    docx_resp = client.get(f"/api/export/docx/{resume_id}")
    assert docx_resp.status_code == 200
    assert docx_resp.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert len(docx_resp.content) > 1000

    # 12. Templates Catalog
    tpl_resp = client.get("/api/templates")
    assert tpl_resp.status_code == 200
    assert len(tpl_resp.json()) >= 6

    # 13. Delete resume without auth headers
    del_res = client.delete(f"/api/resumes/{resume_id}")
    assert del_res.status_code == 200

def test_resume_cascades_and_foreign_keys():
    # Create resume without auth headers
    r = client.post("/api/resumes", json={"title": "Cascade Resume"})
    assert r.status_code == 200
    res_id = r.json()["id"]

    # Create job match attached to resume
    client.post("/api/job-match/analyze", json={
        "resume_id": res_id,
        "job_title": "Backend Dev",
        "job_description": "Python, SQL, APIs required."
    })

    # Create cover letter attached to resume
    cl = client.post("/api/cover-letters", json={
        "resume_id": res_id,
        "company_name": "Test Co",
        "job_title": "Backend Dev"
    })
    assert cl.status_code == 200
    cl_id = cl.json()["id"]

    # Create job application attached to resume
    ja = client.post("/api/career/applications", json={
        "resume_id": res_id,
        "company": "Test Co",
        "job_title": "Backend Dev"
    })
    assert ja.status_code == 200
    ja_id = ja.json()["id"]

    # Delete resume directly while all children are active
    del_res = client.delete(f"/api/resumes/{res_id}")
    assert del_res.status_code == 200

    # Verify cover letter still exists and resume_id is nullified
    cl_check = client.get(f"/api/cover-letters/{cl_id}")
    assert cl_check.status_code == 200
    assert cl_check.json()["resume_id"] is None

    # Verify job application still exists and resume_id is nullified
    ja_check = client.get("/api/career/applications")
    assert ja_check.status_code == 200
    found_ja = next(a for a in ja_check.json() if a["id"] == ja_id)
    assert found_ja["resume_id"] is None

def test_ai_services_and_security():
    # 1. Status endpoint never leaks API keys
    status_resp = client.get("/api/ai/status")
    assert status_resp.status_code == 200
    data = status_resp.json()
    assert "status" in data
    assert data["status"] == "ready"
    assert "api_key" not in data
    assert "GEMINI_API_KEY" not in data
    assert "OPENAI_API_KEY" not in data

    # 2. LinkedIn summary generation
    linkedin_resp = client.post("/api/ai/linkedin-summary", json={
        "target_role": "Lead Systems Architect",
        "full_name": "Taylor Architect",
        "skills": ["Distributed Systems", "Python", "Kubernetes"]
    })
    assert linkedin_resp.status_code == 200
    li_data = linkedin_resp.json()
    assert "headline" in li_data and len(li_data["headline"]) > 10
    assert "about" in li_data and len(li_data["about"]) > 30

    # 3. Dynamic interview questions generation without any authentication
    iq_resp = client.post("/api/career/interview-questions", json={
        "target_role": "Full-Stack Engineer",
        "company_name": "Google",
    })
    assert iq_resp.status_code == 200
    iq_data = iq_resp.json()
    assert len(iq_data["questions"]) == 5
    for q in iq_data["questions"]:
        assert "category" in q and "question" in q and "tip" in q

def test_config_and_api_key_loading():
    from app.config import Settings, settings

    # Verify settings instance
    assert isinstance(settings.PROJECT_NAME, str) and len(settings.PROJECT_NAME) > 0
    assert isinstance(settings.DATABASE_URL, str) and len(settings.DATABASE_URL) > 0
    assert isinstance(settings.ACCESS_TOKEN_EXPIRE_MINUTES, int) and settings.ACCESS_TOKEN_EXPIRE_MINUTES > 0
    assert isinstance(settings.GROQ_API_KEY, str)
    assert isinstance(settings.GEMINI_API_KEY, str)
    assert isinstance(settings.OPENAI_API_KEY, str)
    assert isinstance(settings.has_groq, bool)
    assert isinstance(settings.has_gemini, bool)
    assert isinstance(settings.has_openai, bool)
    assert isinstance(settings.GROQ_MODEL, str)
    assert isinstance(settings.GEMINI_MODEL, str)

    # Verify safe AI status endpoint
    status_resp = client.get("/api/ai/status")
    assert status_resp.status_code == 200
    st = status_resp.json()
    assert "message" in st
    assert st["status"] == "ready"

def test_groq_succeeds_gemini_not_called(monkeypatch):
    from unittest.mock import patch
    from app.services import ai_service
    from app.config import settings

    monkeypatch.setattr(settings, "GROQ_API_KEY", "gsk_test_mock_12345")
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "gemini_test_mock_12345")

    with patch("app.services.ai_service.call_groq", return_value="Response from Groq") as mock_groq, \
         patch("app.services.ai_service.call_gemini") as mock_gemini:
        res = ai_service.call_cloud_ai_with_meta("Hello")
        assert res["text"] == "Response from Groq"
        assert res["provider"] == "Groq"
        assert res["fallback_used"] is False
        mock_groq.assert_called_once()
        mock_gemini.assert_not_called()

def test_groq_fails_gemini_succeeds(monkeypatch):
    from unittest.mock import patch
    from app.services import ai_service
    from app.config import settings

    monkeypatch.setattr(settings, "GROQ_API_KEY", "gsk_test_mock_12345")
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "gemini_test_mock_12345")

    with patch("app.services.ai_service.call_groq", return_value=None) as mock_groq, \
         patch("app.services.ai_service.call_gemini", return_value="Response from Gemini Fallback") as mock_gemini:
        res = ai_service.call_cloud_ai_with_meta("Hello")
        assert res["text"] == "Response from Gemini Fallback"
        assert res["provider"] == "Google Gemini"
        assert res["fallback_used"] is True
        mock_groq.assert_called_once()
        mock_gemini.assert_called_once()

def test_groq_key_missing_gemini_attempted(monkeypatch):
    from unittest.mock import patch
    from app.services import ai_service
    from app.config import settings

    monkeypatch.setattr(settings, "GROQ_API_KEY", "")
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "gemini_test_mock_12345")

    with patch("app.services.ai_service.call_groq") as mock_groq, \
         patch("app.services.ai_service.call_gemini", return_value="Response from Gemini") as mock_gemini:
        res = ai_service.call_cloud_ai_with_meta("Hello")
        assert res["text"] == "Response from Gemini"
        assert res["provider"] == "Google Gemini"
        mock_groq.assert_not_called()
        mock_gemini.assert_called_once()

def test_both_providers_fail_safe_error(monkeypatch):
    from unittest.mock import patch
    from app.services import ai_service
    from app.config import settings
    from app.schemas import ChatRequest

    monkeypatch.setattr(settings, "GROQ_API_KEY", "gsk_test_mock_12345")
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "gemini_test_mock_12345")
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "")

    with patch("app.services.ai_service.call_groq", return_value=None), \
         patch("app.services.ai_service.call_gemini", return_value=None):
        chat_req = ChatRequest(message="Give me interview advice")
        chat_resp = ai_service.handle_chat_request(chat_req)
        assert "temporarily unavailable" in chat_resp.response.lower()
        assert "gsk_" not in chat_resp.response
        assert "gemini" not in chat_resp.response
        assert chat_resp.fallback_used is True

def test_both_api_keys_missing_configuration_error(monkeypatch):
    from app.services import ai_service
    from app.config import settings
    from app.schemas import ChatRequest

    monkeypatch.setattr(settings, "GROQ_API_KEY", "")
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    monkeypatch.setattr(settings, "OPENAI_API_KEY", "")

    chat_req = ChatRequest(message="Can you help me?")
    chat_resp = ai_service.handle_chat_request(chat_req)
    assert "not configured" in chat_resp.response.lower()
    assert chat_resp.provider == "None"

def test_chat_endpoint_via_client(monkeypatch):
    from unittest.mock import patch
    from app.config import settings

    monkeypatch.setattr(settings, "GROQ_API_KEY", "gsk_test_mock_12345")
    monkeypatch.setattr(settings, "GEMINI_API_KEY", "gemini_test_mock_12345")

    with patch("app.services.ai_service.call_groq", return_value="Here is your career advice."):
        resp = client.post("/api/ai/chat", json={
            "message": "How do I highlight my cloud skills?",
            "target_role": "Cloud Architect"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["response"] == "Here is your career advice."
        assert data["provider"] == "Groq"
        assert data["fallback_used"] is False

def test_raw_ats_scoring():
    raw_payload = {
        "content": {
            "personal_info": {
                "full_name": "Test Engineer",
                "email": "test.eng@example.com",
                "phone": "+1 555 123 4567",
                "location": "Austin, TX"
            },
            "summary": "Experienced engineer with a focus on scalable systems.",
            "experience": [
                {
                    "id": "e1",
                    "company": "Tech Corp",
                    "role": "Software Engineer",
                    "start_date": "2020",
                    "end_date": "2023",
                    "bullets": ["Architected scalable web apps"]
                }
            ],
            "skills": [
                {"id": "s1", "name": "Technical", "skills": ["Python", "FastAPI"]}
            ]
        },
        "target_role": "Backend Developer"
    }
    resp = client.post("/api/ats/analyze-raw", json=raw_payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "score" in data
    assert data["score"] > 0
    assert len(data["issues"]) > 0

def test_resume_versioning_and_restore():
    # Create resume
    r = client.post("/api/resumes", json={"title": "Versioning Test"})
    assert r.status_code == 200
    res_id = r.json()["id"]

    # Initial version exists
    versions_resp = client.get(f"/api/resumes/{res_id}/versions")
    assert versions_resp.status_code == 200
    versions = versions_resp.json()
    assert len(versions) >= 1
    initial_ver_id = versions[0]["id"]

    # Update resume content
    new_content = dict(r.json()["content"])
    new_content["summary"] = "Updated version summary for snapshot testing."
    up_resp = client.put(f"/api/resumes/{res_id}", json={"content": new_content})
    assert up_resp.status_code == 200

    # Restore initial version using /restore/ route
    restore_resp = client.post(f"/api/resumes/{res_id}/restore/{initial_ver_id}")
    assert restore_resp.status_code == 200
    restored = restore_resp.json()
    assert restored["content"]["summary"] != "Updated version summary for snapshot testing."

    # Cleanup
    client.delete(f"/api/resumes/{res_id}")

def test_resume_sharing_endpoint():
    r = client.post("/api/resumes", json={"title": "Sharing Test"})
    assert r.status_code == 200
    res_id = r.json()["id"]

    # Toggle share
    share_resp = client.post(f"/api/resumes/{res_id}/share")
    assert share_resp.status_code == 200
    share_token = share_resp.json()["share_token"]
    assert share_token is not None

    # Retrieve shared resume via /shared/{token} and /share/{token}
    pub_resp = client.get(f"/api/resumes/shared/{share_token}")
    assert pub_resp.status_code == 200
    assert pub_resp.json()["id"] == res_id

    pub_resp2 = client.get(f"/api/resumes/share/{share_token}")
    assert pub_resp2.status_code == 200
    assert pub_resp2.json()["id"] == res_id

    # Cleanup
    client.delete(f"/api/resumes/{res_id}")

def test_interview_questions_and_linkedin_summary():
    iq_resp = client.post("/api/career/interview-questions", json={
        "target_role": "Site Reliability Engineer",
        "company_name": "CloudTech"
    })
    assert iq_resp.status_code == 200
    iq_data = iq_resp.json()
    assert iq_data["role"] == "Site Reliability Engineer"
    assert len(iq_data["questions"]) >= 3

    li_resp = client.post("/api/ai/linkedin-summary", json={
        "target_role": "Full Stack Engineer",
        "full_name": "Alex Morgan",
        "skills": ["React", "Python"]
    })
    assert li_resp.status_code == 200
    li_data = li_resp.json()
    assert "headline" in li_data
    assert "about" in li_data

def test_internship_checklist_and_json_import_export():
    chk_resp = client.get("/api/career/internship-checklist")
    assert chk_resp.status_code == 200
    assert len(chk_resp.json()) >= 3

    # Create resume for export
    r = client.post("/api/resumes", json={"title": "JSON Export Test"})
    assert r.status_code == 200
    res_id = r.json()["id"]

    # Export JSON
    exp_resp = client.get(f"/api/export/json/{res_id}")
    assert exp_resp.status_code == 200
    exp_data = exp_resp.json()
    assert exp_data["title"] == "JSON Export Test"

    # Import JSON
    imp_resp = client.post("/api/export/import-json", json=exp_data)
    assert imp_resp.status_code == 200
    assert "Imported" in imp_resp.json()["title"]

    # Cleanup
    client.delete(f"/api/resumes/{res_id}")
    client.delete(f"/api/resumes/{imp_resp.json()['id']}")
