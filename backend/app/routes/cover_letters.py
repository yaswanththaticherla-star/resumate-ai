from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.workspace import get_workspace_user
from app.services.ai_service import generate_cover_letter_content

router = APIRouter(prefix="/api/cover-letters", tags=["cover-letters"])

@router.get("", response_model=List[schemas.CoverLetterOut])
def list_cover_letters(
    db: Session = Depends(get_db)
):
    return db.query(models.CoverLetter).order_by(models.CoverLetter.updated_at.desc()).all()

@router.post("", response_model=schemas.CoverLetterOut)
def create_cover_letter(
    letter_in: schemas.CoverLetterCreate,
    db: Session = Depends(get_db)
):
    workspace_user = get_workspace_user(db)
    content_text = letter_in.content
    if not content_text:
        # Generate initial draft
        user_name = workspace_user.full_name
        user_email = workspace_user.email
        user_phone = ""
        key_skills = []

        if letter_in.resume_id:
            resume = db.query(models.Resume).filter(models.Resume.id == letter_in.resume_id).first()
            if resume and resume.content:
                p_info = resume.content.get("personal_info", {})
                user_phone = p_info.get("phone", "")
                for cat in resume.content.get("skills", []):
                    key_skills.extend(cat.get("skills", []))

        content_text = generate_cover_letter_content(
            user_name=user_name,
            user_email=user_email,
            user_phone=user_phone,
            company_name=letter_in.company_name,
            job_title=letter_in.job_title,
            recipient_name=letter_in.recipient_name,
            job_description=letter_in.job_description,
            key_skills=key_skills,
            tone=letter_in.tone,
            length=letter_in.length
        )

    letter = models.CoverLetter(
        user_id=workspace_user.id,
        resume_id=letter_in.resume_id,
        title=letter_in.title or f"Cover Letter - {letter_in.company_name}",
        company_name=letter_in.company_name,
        job_title=letter_in.job_title,
        recipient_name=letter_in.recipient_name,
        recipient_title=letter_in.recipient_title,
        job_description=letter_in.job_description,
        tone=letter_in.tone,
        length=letter_in.length,
        content=content_text
    )
    db.add(letter)
    db.commit()
    db.refresh(letter)
    return letter

@router.get("/{letter_id}", response_model=schemas.CoverLetterOut)
def get_cover_letter(
    letter_id: int,
    db: Session = Depends(get_db)
):
    letter = db.query(models.CoverLetter).filter(models.CoverLetter.id == letter_id).first()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found.")
    return letter

@router.put("/{letter_id}", response_model=schemas.CoverLetterOut)
def update_cover_letter(
    letter_id: int,
    letter_update: schemas.CoverLetterUpdate,
    db: Session = Depends(get_db)
):
    letter = db.query(models.CoverLetter).filter(models.CoverLetter.id == letter_id).first()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found.")

    if letter_update.title is not None:
        letter.title = letter_update.title
    if letter_update.company_name is not None:
        letter.company_name = letter_update.company_name
    if letter_update.job_title is not None:
        letter.job_title = letter_update.job_title
    if letter_update.recipient_name is not None:
        letter.recipient_name = letter_update.recipient_name
    if letter_update.recipient_title is not None:
        letter.recipient_title = letter_update.recipient_title
    if letter_update.job_description is not None:
        letter.job_description = letter_update.job_description
    if letter_update.tone is not None:
        letter.tone = letter_update.tone
    if letter_update.length is not None:
        letter.length = letter_update.length
    if letter_update.content is not None:
        letter.content = letter_update.content

    db.commit()
    db.refresh(letter)
    return letter

@router.delete("/{letter_id}")
def delete_cover_letter(
    letter_id: int,
    db: Session = Depends(get_db)
):
    letter = db.query(models.CoverLetter).filter(models.CoverLetter.id == letter_id).first()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found.")

    db.delete(letter)
    db.commit()
    return {"message": "Cover letter deleted successfully."}

@router.post("/{letter_id}/duplicate", response_model=schemas.CoverLetterOut)
def duplicate_cover_letter(
    letter_id: int,
    db: Session = Depends(get_db)
):
    letter = db.query(models.CoverLetter).filter(models.CoverLetter.id == letter_id).first()
    if not letter:
        raise HTTPException(status_code=404, detail="Cover letter not found.")

    workspace_user = get_workspace_user(db)
    new_letter = models.CoverLetter(
        user_id=workspace_user.id,
        resume_id=letter.resume_id,
        title=f"{letter.title} (Copy)",
        company_name=letter.company_name,
        job_title=letter.job_title,
        recipient_name=letter.recipient_name,
        recipient_title=letter.recipient_title,
        job_description=letter.job_description,
        tone=letter.tone,
        length=letter.length,
        content=letter.content
    )
    db.add(new_letter)
    db.commit()
    db.refresh(new_letter)
    return new_letter

