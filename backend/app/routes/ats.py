from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services.ats_engine import analyze_resume_ats

router = APIRouter(prefix="/api/ats", tags=["ats"])

@router.get("/analyze/{resume_id}", response_model=schemas.ATSResult)
def analyze_by_id(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    resume = db.query(models.Resume).filter(
        models.Resume.id == resume_id,
        models.Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    res = analyze_resume_ats(resume.content, resume.target_role or "")
    # Update cached ats_score on resume
    if resume.ats_score != res.score:
        resume.ats_score = res.score
        db.commit()
    return res

@router.post("/analyze-raw", response_model=schemas.ATSResult)
def analyze_raw(
    content: dict,
    target_role: str = ""
):
    return analyze_resume_ats(content, target_role)

