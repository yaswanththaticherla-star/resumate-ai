from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services.ai_service import generate_interview_questions_content

router = APIRouter(prefix="/api/career", tags=["career"])

@router.get("/applications", response_model=List[schemas.JobApplicationOut])
def list_job_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return db.query(models.JobApplication).filter(
        models.JobApplication.user_id == current_user.id
    ).order_by(models.JobApplication.updated_at.desc()).all()

@router.post("/applications", response_model=schemas.JobApplicationOut)
def create_job_application(
    app_in: schemas.JobApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    job_app = models.JobApplication(
        user_id=current_user.id,
        resume_id=app_in.resume_id,
        company=app_in.company,
        job_title=app_in.job_title,
        location=app_in.location,
        salary_range=app_in.salary_range,
        status=app_in.status,
        applied_date=app_in.applied_date,
        job_url=app_in.job_url,
        notes=app_in.notes
    )
    db.add(job_app)
    db.commit()
    db.refresh(job_app)
    return job_app

@router.put("/applications/{app_id}", response_model=schemas.JobApplicationOut)
def update_job_application(
    app_id: int,
    app_update: schemas.JobApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    job_app = db.query(models.JobApplication).filter(
        models.JobApplication.id == app_id,
        models.JobApplication.user_id == current_user.id
    ).first()
    if not job_app:
        raise HTTPException(status_code=404, detail="Application record not found.")

    if app_update.company is not None:
        job_app.company = app_update.company
    if app_update.job_title is not None:
        job_app.job_title = app_update.job_title
    if app_update.location is not None:
        job_app.location = app_update.location
    if app_update.salary_range is not None:
        job_app.salary_range = app_update.salary_range
    if app_update.status is not None:
        job_app.status = app_update.status
    if app_update.applied_date is not None:
        job_app.applied_date = app_update.applied_date
    if app_update.job_url is not None:
        job_app.job_url = app_update.job_url
    if app_update.notes is not None:
        job_app.notes = app_update.notes
    if app_update.resume_id is not None:
        job_app.resume_id = app_update.resume_id

    db.commit()
    db.refresh(job_app)
    return job_app

@router.delete("/applications/{app_id}")
def delete_job_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    job_app = db.query(models.JobApplication).filter(
        models.JobApplication.id == app_id,
        models.JobApplication.user_id == current_user.id
    ).first()
    if not job_app:
        raise HTTPException(status_code=404, detail="Application record not found.")

    db.delete(job_app)
    db.commit()
    return {"message": "Application deleted successfully."}

@router.post("/interview-questions")
def generate_interview_questions(
    data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume_id = data.get("resume_id")
    target_role = data.get("target_role", "Software Engineer")
    
    company_name = data.get("company_name", "Target Company")
    skills = []
    projects = []
    
    if resume_id:
        resume = db.query(models.Resume).filter(
            models.Resume.id == resume_id,
            models.Resume.user_id == current_user.id
        ).first()
        if resume and resume.content:
            for cat in resume.content.get("skills", []):
                skills.extend(cat.get("skills", []))
            for p in resume.content.get("projects", []):
                projects.append(p.get("name", ""))

    questions = generate_interview_questions_content(
        target_role=target_role,
        company_name=company_name,
        skills=skills,
        projects=projects
    )

    return {
        "role": target_role,
        "company": company_name,
        "questions": questions
    }

@router.get("/internship-checklist")
def get_internship_checklist():
    return [
        {
            "phase": "Phase 1: Resume & Profile Foundation",
            "items": [
                {"id": "chk-1", "label": "Format resume in clean single-column ATS layout", "recommended": True},
                {"id": "chk-2", "label": "Ensure contact email is professional and phone includes country code", "recommended": True},
                {"id": "chk-3", "label": "Include live GitHub and portfolio demo links with working SSL", "recommended": True},
                {"id": "chk-4", "label": "Highlight GPA/honors if above 3.5 / 4.0 or top 10% of class", "recommended": False}
            ]
        },
        {
            "phase": "Phase 2: Project Portfolio & Evidence",
            "items": [
                {"id": "chk-5", "label": "Feature 2-3 end-to-end full stack or systems projects with READMEs", "recommended": True},
                {"id": "chk-6", "label": "Verify all demo deployments and repos are public with clear setup steps", "recommended": True},
                {"id": "chk-7", "label": "Quantify outcomes (e.g. latency, user metrics, test coverage)", "recommended": True}
            ]
        },
        {
            "phase": "Phase 3: Active Application Strategy",
            "items": [
                {"id": "chk-8", "label": "Tailor headline and summary for each target role using Job Matcher", "recommended": True},
                {"id": "chk-9", "label": "Generate tailored cover letter addressing specific team mission", "recommended": True},
                {"id": "chk-10", "label": "Log applied role in Career Tracker to monitor follow-ups within 7 days", "recommended": True}
            ]
        }
    ]

