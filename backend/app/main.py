from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.config import settings
from app.auth import get_password_hash
from app import models
from app.routes import (
    auth,
    resumes,
    templates,
    ats,
    ai,
    job_match,
    cover_letters,
    career_tools,
    export
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

def seed_demo_user():
    """Ensure standard demo account exists for immediate testing."""
    db = SessionLocal()
    try:
        demo_email = "alex.morgan@resumate.ai"
        existing = db.query(models.User).filter(models.User.email == demo_email).first()
        if not existing:
            demo_user = models.User(
                email=demo_email,
                full_name="Alex Morgan",
                hashed_password=get_password_hash("Password123!"),
                headline="Senior Full-Stack Software Engineer"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            starter_content = {
                "personal_info": {
                    "full_name": demo_user.full_name,
                    "headline": "Senior Full-Stack Software Engineer",
                    "email": demo_user.email,
                    "phone": "+1 (555) 019-2834",
                    "location": "San Francisco, CA",
                    "website": "https://alexmorgan.dev",
                    "linkedin": "https://linkedin.com/in/alexmorgan",
                    "github": "https://github.com/alexmorgan",
                    "avatar_url": ""
                },
                "summary": "Results-driven Senior Full-Stack Engineer with 5+ years of experience architecting high-throughput distributed APIs and real-time React web applications. Proven track record in reducing API latency by 35%, streamlining automated CI/CD pipelines, and leading agile engineering teams.",
                "experience": [
                    {
                        "id": "exp-1",
                        "company": "TechVanguard Solutions",
                        "role": "Senior Software Engineer",
                        "location": "San Francisco, CA",
                        "start_date": "2022-01",
                        "end_date": "Present",
                        "current": True,
                        "bullets": [
                            "Architected high-throughput RESTful APIs using FastAPI and PostgreSQL, serving 120,000+ daily active users.",
                            "Engineered real-time collaboration dashboards in React and TypeScript, decreasing page load time by 34%.",
                            "Streamlined automated CI/CD pipelines via GitHub Actions, reducing deployment turnaround from 45 to 8 minutes."
                        ],
                        "technologies": ["React", "TypeScript", "FastAPI", "PostgreSQL", "Docker", "AWS"]
                    }
                ],
                "education": [
                    {
                        "id": "edu-1",
                        "institution": "University of California, Berkeley",
                        "degree": "Bachelor of Science",
                        "field_of_study": "Computer Science",
                        "start_date": "2015-09",
                        "graduation_date": "2019-05",
                        "gpa": "3.85 / 4.0",
                        "honors": "Dean's Honors List",
                        "coursework": ["Data Structures", "Algorithms", "Distributed Systems", "Database Architecture"]
                    }
                ],
                "skills": [
                    {
                        "id": "skill-1",
                        "name": "Languages & Frameworks",
                        "skills": ["TypeScript", "JavaScript", "Python", "React", "Node.js", "FastAPI", "Tailwind CSS", "SQL"]
                    },
                    {
                        "id": "skill-2",
                        "name": "Cloud & Infrastructure",
                        "skills": ["AWS", "Docker", "PostgreSQL", "Redis", "CI/CD", "Git", "Linux"]
                    }
                ],
                "projects": [
                    {
                        "id": "proj-1",
                        "name": "CloudMetrics Platform",
                        "description": "Distributed telemetry visualization service for cloud microservices.",
                        "role": "Lead Architect",
                        "technologies": ["React", "FastAPI", "Docker", "Prometheus"],
                        "outcomes": "Processed over 5M metric events/day with sub-second real-time latency.",
                        "repo_url": "https://github.com/alexmorgan/cloudmetrics",
                        "live_url": "https://cloudmetrics.demo.io"
                    }
                ],
                "certifications": [
                    {
                        "id": "cert-1",
                        "name": "AWS Certified Solutions Architect – Associate",
                        "issuer": "Amazon Web Services",
                        "date": "2023-08",
                        "expiry_date": "2026-08",
                        "credential_id": "AWS-091823",
                        "credential_url": "https://aws.amazon.com/verification"
                    }
                ],
                "achievements": [
                    {
                        "id": "ach-1",
                        "title": "First Place – National Collegiate Hackathon",
                        "description": "Built an AI-assisted accessibility reader for visually impaired students among 80+ participating teams.",
                        "date": "2018-11"
                    }
                ],
                "languages": [
                    {"id": "lang-1", "language": "English", "proficiency": "Native"},
                    {"id": "lang-2", "language": "Spanish", "proficiency": "Intermediate"}
                ],
                "custom_sections": [],
                "section_order": ["personal_info", "summary", "experience", "education", "skills", "projects", "certifications", "achievements", "languages"],
                "hidden_sections": []
            }

            demo_resume = models.Resume(
                user_id=demo_user.id,
                title="Full-Stack Software Engineer",
                template_id="ats_classic",
                theme_color="#4F46E5",
                target_role="Senior Full-Stack Engineer",
                ats_score=92,
                content=starter_content
            )
            db.add(demo_resume)
            db.commit()
    except Exception as e:
        db.rollback()
        print(f"Warning: demo seeding skipped: {e}")
    finally:
        db.close()

seed_demo_user()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="ResuMate AI — Smart Resume & Career Builder API"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(templates.router)
app.include_router(ats.router)
app.include_router(ai.router)
app.include_router(job_match.router)
app.include_router(cover_letters.router)
app.include_router(career_tools.router)
app.include_router(export.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "ResuMate AI",
        "version": "1.0.0"
    }

