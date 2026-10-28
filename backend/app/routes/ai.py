from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from app import schemas
from app.config import settings
from app.services.ai_service import (
    enhance_summary as service_enhance_summary,
    enhance_bullets as service_enhance_bullets,
    check_grammar as service_check_grammar,
    suggest_skills_for_role as service_suggest_skills_for_role,
    generate_linkedin_summary_content,
    get_active_provider_name
)

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.get("/status")
def get_ai_status():
    has_gemini = settings.has_gemini
    has_openai = settings.has_openai
    provider = get_active_provider_name()
    is_cloud = has_gemini or has_openai

    if is_cloud:
        msg = f"Connected to {provider}. Real generative AI responses enabled."
    else:
        msg = "Local deterministic ATS heuristic engine active. To enable cloud generative AI, configure GEMINI_API_KEY in backend/.env."

    return {
        "status": "ready",
        "provider": provider,
        "is_cloud_active": is_cloud,
        "model": settings.GEMINI_MODEL if has_gemini else None,
        "message": msg
    }

@router.post("/improve-summary", response_model=schemas.AISuggestionOut)
def improve_summary(req: schemas.ImproveSummaryRequest):
    return service_enhance_summary(
        current_summary=req.current_summary,
        target_role=req.target_role or "",
        experience_level=req.experience_level or "Mid-level",
        tone=req.tone or "Impactful"
    )

@router.post("/enhance-bullets", response_model=List[schemas.AISuggestionOut])
def enhance_bullets(req: schemas.EnhanceBulletsRequest):
    return service_enhance_bullets(
        bullets=req.bullet_points,
        job_role=req.job_role or "",
        company=req.company or ""
    )

@router.post("/suggest-skills", response_model=List[str])
def suggest_skills(req: schemas.SuggestSkillsRequest):
    return service_suggest_skills_for_role(
        target_role=req.target_role,
        current_skills=req.current_skills
    )

@router.post("/grammar-check", response_model=schemas.AISuggestionOut)
def grammar_check(req: schemas.GrammarCheckRequest):
    return service_check_grammar(text=req.text)

@router.post("/linkedin-summary")
def generate_linkedin_summary(data: Dict[str, Any]):
    role = data.get("target_role", "Software Engineer")
    name = data.get("full_name", "Professional")
    skills = data.get("skills", ["Full-Stack Development", "Cloud Architecture"])
    skills_list = skills if isinstance(skills, list) else [str(skills)]

    return generate_linkedin_summary_content(
        target_role=role,
        full_name=name,
        skills=skills_list
    )

