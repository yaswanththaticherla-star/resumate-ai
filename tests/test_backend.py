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

def test_unauthenticated_requests():
    # Unauthenticated request to /api/auth/me must return 401
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401
    assert "detail" in resp.json()

def test_invalid_and_expired_tokens():
    # Invalid token format / fake token
    resp = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid_fake_token_123"})
    assert resp.status_code == 401

    # Malformed authorization header
    resp2 = client.get("/api/auth/me", headers={"Authorization": "NotBearer 12345"})
    assert resp2.status_code == 401

def test_duplicate_registration_and_wrong_password():
    unique_email = f"user_{datetime.datetime.now().timestamp()}@resumate.ai"
    # 1. Register valid user
    r1 = client.post("/api/auth/register", json={
        "email": unique_email,
        "full_name": "Unique User",
        "password": "ValidPassword123!"
    })
    assert r1.status_code in (200, 201)
    assert "access_token" in r1.json()
    assert r1.json()["user"]["email"] == unique_email

    # 2. Duplicate registration with same email must return 409 or 400
    r2 = client.post("/api/auth/register", json={
        "email": unique_email,
        "full_name": "Another User",
        "password": "ValidPassword123!"
    })
    assert r2.status_code in (400, 409)
    assert "already exists" in r2.json()["detail"].lower()

    # 3. Login with wrong password must return 401
    r3 = client.post("/api/auth/login", json={
        "email": unique_email,
        "password": "WrongPassword999!"
    })
    assert r3.status_code == 401
    assert "incorrect" in r3.json()["detail"].lower()

def test_demo_user_authentication():
    # Demo user seeded on startup must log in cleanly with real JWT
    resp = client.post("/api/auth/login", json={
        "email": "alex.morgan@resumate.ai",
        "password": "Password123!"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["full_name"] == "Alex Morgan"

    # Use token on /api/auth/me
    token = data["access_token"]
    me_resp = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == "alex.morgan@resumate.ai"

    # Profile update with token
    up_resp = client.put("/api/auth/profile", json={
        "headline": "Lead Full-Stack Architect",
        "theme_preference": "dark"
    }, headers={"Authorization": f"Bearer {token}"})
    assert up_resp.status_code == 200
    assert up_resp.json()["headline"] == "Lead Full-Stack Architect"

def test_templates_and_account_data():
    # Templates catalog is public
    tpl = client.get("/api/templates")
    assert tpl.status_code == 200
    assert len(tpl.json()) >= 6

    # Account data export with demo user token
    login_resp = client.post("/api/auth/login", json={
        "email": "alex.morgan@resumate.ai",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    acc = client.get("/api/export/account-data", headers={"Authorization": f"Bearer {token}"})
    assert acc.status_code == 200
    assert "user" in acc.json()
    assert "resumes" in acc.json()

def test_new_user_empty_state_and_full_lifecycle():
    ts = datetime.datetime.now().timestamp()
    test_email = f"lifecycle_{ts}@resumate.ai"

    # 1. Register new user
    reg_resp = client.post("/api/auth/register", json={
        "email": test_email,
        "full_name": "Jane Developer",
        "password": "StrongPassword123!"
    })
    assert reg_resp.status_code in (200, 201)
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Authentic empty state: newly registered user must start with 0 resumes
    list_resp = client.get("/api/resumes", headers=headers)
    assert list_resp.status_code == 200
    assert list_resp.json() == []

    # 3. Create resume with auth headers
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
    }, headers=headers)
    assert create_resp.status_code == 200
    created_resume = create_resp.json()
    resume_id = created_resume["id"]
    assert created_resume["title"] == "Jane Senior Engineer"
    assert created_resume["ats_score"] > 70

    # 4. Read resume by id with auth headers
    get_resp = client.get(f"/api/resumes/{resume_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == resume_id

    # 5. Update resume with auth headers
    update_resp = client.put(f"/api/resumes/{resume_id}", json={
        "title": "Jane Developer - Principal Resume",
        "target_role": "Principal Systems Architect"
    }, headers=headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["title"] == "Jane Developer - Principal Resume"

    # 6. Check ATS analyzer with auth headers
    ats_resp = client.get(f"/api/ats/analyze/{resume_id}", headers=headers)
    assert ats_resp.status_code == 200
    ats_data = ats_resp.json()
    assert ats_data["score"] >= 70
    assert ats_data["passed_checks"] > 0
    assert "summary_feedback" in ats_data

    # 7. Job Matcher with auth headers
    match_resp = client.post("/api/job-match/analyze", json={
        "resume_id": resume_id,
        "job_title": "Principal Backend Architect",
        "company": "HyperScale Cloud",
        "job_description": "We are seeking a Principal Backend Architect with deep expertise in Python, FastAPI, PostgreSQL, Redis, and distributed systems."
    }, headers=headers)
    assert match_resp.status_code == 200
    match_res = match_resp.json()
    assert match_res["match_score"] >= 60
    assert "Python" in match_res["matching_skills"] or "Fastapi" in match_res["matching_skills"]

    # 8. Check job match history persistence with auth headers
    hist_resp = client.get("/api/job-match/history", headers=headers)
    assert hist_resp.status_code == 200
    assert len(hist_resp.json()) >= 1
    match_id = hist_resp.json()[0]["id"]

    # Delete match history item
    del_hist = client.delete(f"/api/job-match/history/{match_id}", headers=headers)
    assert del_hist.status_code == 200

    # 9. Cover Letter builder with auth headers
    cl_resp = client.post("/api/cover-letters", json={
        "title": "Cover Letter - HyperScale Cloud",
        "company_name": "HyperScale Cloud",
        "job_title": "Principal Backend Architect",
        "resume_id": resume_id
    }, headers=headers)
    assert cl_resp.status_code == 200
    cl_data = cl_resp.json()
    assert "HyperScale Cloud" in cl_data["content"]
    cl_id = cl_data["id"]

    # List cover letters with auth headers
    cl_list = client.get("/api/cover-letters", headers=headers)
    assert cl_list.status_code == 200
    assert len(cl_list.json()) >= 1

    # Delete cover letter with auth headers
    del_cl = client.delete(f"/api/cover-letters/{cl_id}", headers=headers)
    assert del_cl.status_code == 200

    # 10. Job Application Tracker with auth headers
    app_resp = client.post("/api/career/applications", json={
        "company": "HyperScale Cloud",
        "job_title": "Principal Backend Architect",
        "status": "applied",
        "location": "Seattle, WA",
        "salary_range": "$220,000 - $260,000",
        "resume_id": resume_id,
        "notes": "Applied via referral"
    }, headers=headers)
    assert app_resp.status_code == 200
    app_id = app_resp.json()["id"]

    # Update application status with auth headers
    up_app = client.put(f"/api/career/applications/{app_id}", json={
        "status": "interviewing"
    }, headers=headers)
    assert up_app.status_code == 200
    assert up_app.json()["status"] == "interviewing"

    # List applications with auth headers
    app_list = client.get("/api/career/applications", headers=headers)
    assert app_list.status_code == 200
    assert len(app_list.json()) >= 1

    # Delete application with auth headers
    del_app = client.delete(f"/api/career/applications/{app_id}", headers=headers)
    assert del_app.status_code == 200

    # 11. AI Status & Services
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

    # 12. DOCX Export with auth headers
    docx_resp = client.get(f"/api/export/docx/{resume_id}", headers=headers)
    assert docx_resp.status_code == 200
    assert docx_resp.headers["content-type"] == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    assert len(docx_resp.content) > 1000

    # 13. Templates Catalog
    tpl_resp = client.get("/api/templates")
    assert tpl_resp.status_code == 200
    assert len(tpl_resp.json()) >= 6

    # 14. Delete resume with auth headers
    del_res = client.delete(f"/api/resumes/{resume_id}", headers=headers)
    assert del_res.status_code == 200

def test_resume_cascades_and_foreign_keys():
    # Login with demo user
    login_resp = client.post("/api/auth/login", json={
        "email": "alex.morgan@resumate.ai",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create resume with auth headers
    r = client.post("/api/resumes", json={"title": "Cascade Resume"}, headers=headers)
    assert r.status_code == 200
    res_id = r.json()["id"]

    # Create job match attached to resume
    client.post("/api/job-match/analyze", json={
        "resume_id": res_id,
        "job_title": "Backend Dev",
        "job_description": "Python, SQL, APIs required."
    }, headers=headers)

    # Create cover letter attached to resume
    cl = client.post("/api/cover-letters", json={
        "resume_id": res_id,
        "company_name": "Test Co",
        "job_title": "Backend Dev"
    }, headers=headers)
    assert cl.status_code == 200
    cl_id = cl.json()["id"]

    # Create job application attached to resume
    ja = client.post("/api/career/applications", json={
        "resume_id": res_id,
        "company": "Test Co",
        "job_title": "Backend Dev"
    }, headers=headers)
    assert ja.status_code == 200
    ja_id = ja.json()["id"]

    # Delete resume directly while all children are active
    del_res = client.delete(f"/api/resumes/{res_id}", headers=headers)
    assert del_res.status_code == 200

    # Verify cover letter still exists and resume_id is nullified
    cl_check = client.get(f"/api/cover-letters/{cl_id}", headers=headers)
    assert cl_check.status_code == 200
    assert cl_check.json()["resume_id"] is None

    # Verify job application still exists and resume_id is nullified
    ja_check = client.get("/api/career/applications", headers=headers)
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

    # 3. Dynamic interview questions generation with auth token
    login_resp = client.post("/api/auth/login", json={
        "email": "alex.morgan@resumate.ai",
        "password": "Password123!"
    })
    token = login_resp.json()["access_token"]
    iq_resp = client.post("/api/career/interview-questions", json={
        "target_role": "Full-Stack Engineer",
        "company_name": "Google",
    }, headers={"Authorization": f"Bearer {token}"})
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



