import secrets
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.workspace import get_workspace_user
from app.services.ats_engine import analyze_resume_ats

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

def get_user_resume(db: Session, resume_id: int) -> Optional[models.Resume]:
    return db.query(models.Resume).filter(models.Resume.id == resume_id).first()

@router.get("", response_model=List[schemas.ResumeOut])
def list_resumes(db: Session = Depends(get_db)):
    return db.query(models.Resume).order_by(models.Resume.updated_at.desc()).all()

@router.post("", response_model=schemas.ResumeOut)
def create_resume(
    resume_in: schemas.ResumeCreate,
    db: Session = Depends(get_db)
):
    workspace_user = get_workspace_user(db)
    default_content = {
        "personal_info": {
            "full_name": workspace_user.full_name,
            "headline": workspace_user.headline or "Professional",
            "email": workspace_user.email,
            "phone": "",
            "location": "",
            "website": "",
            "linkedin": "",
            "github": "",
            "avatar_url": ""
        },
        "summary": "",
        "experience": [],
        "education": [],
        "skills": [
            {"id": "skill-1", "name": "Core Skills", "skills": []}
        ],
        "projects": [],
        "certifications": [],
        "achievements": [],
        "languages": [],
        "custom_sections": [],
        "section_order": ["personal_info", "summary", "experience", "education", "skills", "projects", "certifications", "achievements", "languages"],
        "hidden_sections": []
    }

    content_data = resume_in.content if resume_in.content else default_content
    ats_eval = analyze_resume_ats(content_data, resume_in.target_role or "")

    new_resume = models.Resume(
        user_id=workspace_user.id,
        title=resume_in.title,
        template_id=resume_in.template_id,
        theme_color=resume_in.theme_color,
        font_family=resume_in.font_family,
        font_size=resume_in.font_size,
        spacing=resume_in.spacing,
        target_role=resume_in.target_role,
        ats_score=ats_eval.score,
        content=content_data
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    # Add initial version
    version = models.ResumeVersion(
        resume_id=new_resume.id,
        version_label="Initial Draft",
        content=new_resume.content
    )
    db.add(version)
    db.commit()

    return new_resume

@router.get("/{resume_id}", response_model=schemas.ResumeOut)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    resume = get_user_resume(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return resume

@router.put("/{resume_id}", response_model=schemas.ResumeOut)
def update_resume(
    resume_id: int,
    resume_update: schemas.ResumeUpdate,
    db: Session = Depends(get_db)
):
    resume = get_user_resume(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if resume_update.title is not None:
        resume.title = resume_update.title
    if resume_update.template_id is not None:
        resume.template_id = resume_update.template_id
    if resume_update.theme_color is not None:
        resume.theme_color = resume_update.theme_color
    if resume_update.font_family is not None:
        resume.font_family = resume_update.font_family
    if resume_update.font_size is not None:
        resume.font_size = resume_update.font_size
    if resume_update.spacing is not None:
        resume.spacing = resume_update.spacing
    if resume_update.target_role is not None:
        resume.target_role = resume_update.target_role
    if resume_update.is_public is not None:
        resume.is_public = resume_update.is_public

    if resume_update.content is not None:
        resume.content = resume_update.content
        ats_eval = analyze_resume_ats(resume.content, resume.target_role or "")
        resume.ats_score = ats_eval.score

        # Create autosave version milestone if fewer than 25 versions
        version_count = db.query(models.ResumeVersion).filter(models.ResumeVersion.resume_id == resume.id).count()
        if version_count < 25:
            db.add(models.ResumeVersion(
                resume_id=resume.id,
                version_label="Snapshot",
                content=resume.content
            ))

    db.commit()
    db.refresh(resume)
    return resume

@router.delete("/{resume_id}")
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    resume = get_user_resume(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    # Detach linked cover letters and applications so foreign keys remain valid
    db.query(models.CoverLetter).filter(models.CoverLetter.resume_id == resume.id).update({models.CoverLetter.resume_id: None})
    db.query(models.JobApplication).filter(models.JobApplication.resume_id == resume.id).update({models.JobApplication.resume_id: None})

    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully."}

@router.post("/{resume_id}/duplicate", response_model=schemas.ResumeOut)
def duplicate_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    resume = get_user_resume(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    copy_title = f"{resume.title} (Copy)"
    new_resume = models.Resume(
        user_id=resume.user_id,
        title=copy_title,
        template_id=resume.template_id,
        theme_color=resume.theme_color,
        font_family=resume.font_family,
        font_size=resume.font_size,
        spacing=resume.spacing,
        target_role=resume.target_role,
        ats_score=resume.ats_score,
        content=dict(resume.content)
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    db.add(models.ResumeVersion(
        resume_id=new_resume.id,
        version_label="Duplicated from " + resume.title,
        content=new_resume.content
    ))
    db.commit()

    return new_resume

@router.post("/{resume_id}/share")
def toggle_share(
    resume_id: int,
    db: Session = Depends(get_db)
):
    resume = get_user_resume(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if not resume.share_token:
        resume.share_token = secrets.token_urlsafe(16)
        resume.is_public = True
    else:
        resume.is_public = not resume.is_public

    db.commit()
    return {"is_public": resume.is_public, "share_token": resume.share_token}

@router.get("/share/{share_token}", response_model=schemas.ResumeOut)
@router.get("/shared/{share_token}", response_model=schemas.ResumeOut)
def get_public_resume(
    share_token: str,
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(
        models.Resume.share_token == share_token,
        models.Resume.is_public == True
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Shared resume not found or access revoked.")
    return resume

@router.get("/{resume_id}/versions", response_model=List[schemas.ResumeVersionOut])
def get_versions(
    resume_id: int,
    db: Session = Depends(get_db)
):
    resume = get_user_resume(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return db.query(models.ResumeVersion).filter(models.ResumeVersion.resume_id == resume_id).order_by(models.ResumeVersion.created_at.desc()).all()

@router.post("/{resume_id}/rollback/{version_id}", response_model=schemas.ResumeOut)
@router.post("/{resume_id}/restore/{version_id}", response_model=schemas.ResumeOut)
def rollback_version(
    resume_id: int,
    version_id: int,
    db: Session = Depends(get_db)
):
    resume = get_user_resume(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    version = db.query(models.ResumeVersion).filter(
        models.ResumeVersion.id == version_id,
        models.ResumeVersion.resume_id == resume_id
    ).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version snapshot not found.")

    resume.content = version.content
    ats_eval = analyze_resume_ats(resume.content, resume.target_role or "")
    resume.ats_score = ats_eval.score

    db.commit()
    db.refresh(resume)
    return resume
