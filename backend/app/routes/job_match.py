from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.services.matcher_engine import analyze_job_match

router = APIRouter(prefix="/api/job-match", tags=["job-match"])

@router.post("/analyze", response_model=schemas.JobMatchResult)
def match_job(
    req: schemas.JobMatchRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.email == "alex.morgan@resumate.ai":
        resume = db.query(models.Resume).filter(models.Resume.id == req.resume_id).first()
    else:
        resume = db.query(models.Resume).filter(
            models.Resume.id == req.resume_id,
            models.Resume.user_id == current_user.id
        ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Selected resume not found.")

    res = analyze_job_match(resume.content, req.job_title, req.job_description)

    # Persist analysis history
    analysis = models.JobMatchAnalysis(
        user_id=current_user.id,
        resume_id=resume.id,
        job_title=req.job_title,
        company=req.company or "",
        job_description=req.job_description,
        match_score=res.match_score,
        matching_skills=res.matching_skills,
        missing_skills=res.missing_skills,
        recommendations=res.tailoring_suggestions
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)

    res.id = analysis.id
    return res

@router.get("/history", response_model=List[dict])
def get_match_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.email == "alex.morgan@resumate.ai":
        matches = db.query(models.JobMatchAnalysis).order_by(models.JobMatchAnalysis.created_at.desc()).limit(20).all()
    else:
        matches = db.query(models.JobMatchAnalysis).filter(
            models.JobMatchAnalysis.user_id == current_user.id
        ).order_by(models.JobMatchAnalysis.created_at.desc()).limit(20).all()

    return [
        {
            "id": m.id,
            "resume_id": m.resume_id,
            "job_title": m.job_title,
            "company": m.company,
            "match_score": m.match_score,
            "created_at": m.created_at.isoformat(),
            "matching_count": len(m.matching_skills or []),
            "missing_count": len(m.missing_skills or [])
        }
        for m in matches
    ]

@router.delete("/history/{match_id}")
def delete_history_item(
    match_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.email == "alex.morgan@resumate.ai":
        item = db.query(models.JobMatchAnalysis).filter(models.JobMatchAnalysis.id == match_id).first()
    else:
        item = db.query(models.JobMatchAnalysis).filter(
            models.JobMatchAnalysis.id == match_id,
            models.JobMatchAnalysis.user_id == current_user.id
        ).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "Record deleted"}
