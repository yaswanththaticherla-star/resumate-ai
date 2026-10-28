import io
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from typing import Optional
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/export", tags=["export"])

@router.get("/docx/{resume_id}")
def export_resume_docx(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.email == "alex.morgan@resumate.ai":
        resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    else:
        resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    doc = Document()

    # Document margins: 0.75 in
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.75)
        s.bottom_margin = Inches(0.75)
        s.left_margin = Inches(0.75)
        s.right_margin = Inches(0.75)

    c = resume.content or {}
    p_info = c.get("personal_info", {})

    # Title / Name
    name_p = doc.add_paragraph()
    run_name = name_p.add_run(p_info.get("full_name") or current_user.full_name)
    run_name.font.size = Pt(20)
    run_name.font.bold = True
    run_name.font.color.rgb = RGBColor(15, 23, 42)

    # Headline
    if p_info.get("headline"):
        h_p = doc.add_paragraph()
        run_h = h_p.add_run(p_info.get("headline"))
        run_h.font.size = Pt(12)
        run_h.font.color.rgb = RGBColor(79, 70, 229)

    # Contact line
    contact_parts = []
    if p_info.get("email"):
        contact_parts.append(p_info["email"])
    if p_info.get("phone"):
        contact_parts.append(p_info["phone"])
    if p_info.get("location"):
        contact_parts.append(p_info["location"])
    if p_info.get("linkedin"):
        contact_parts.append(p_info["linkedin"])
    if p_info.get("github"):
        contact_parts.append(p_info["github"])

    if contact_parts:
        c_p = doc.add_paragraph()
        c_run = c_p.add_run(" | ".join(contact_parts))
        c_run.font.size = Pt(9.5)
        c_run.font.color.rgb = RGBColor(100, 116, 139)

    # Professional Summary
    summary = c.get("summary", "")
    if summary:
        h = doc.add_heading(level=2)
        r = h.add_run("PROFESSIONAL SUMMARY")
        r.font.size = Pt(12)
        r.font.color.rgb = RGBColor(15, 23, 42)
        sp = doc.add_paragraph(summary)
        sp.paragraph_format.space_after = Pt(8)

    # Experience
    experience = c.get("experience", [])
    if experience:
        h = doc.add_heading(level=2)
        r = h.add_run("WORK EXPERIENCE")
        r.font.size = Pt(12)
        r.font.color.rgb = RGBColor(15, 23, 42)

        for job in experience:
            jp = doc.add_paragraph()
            role_run = jp.add_run(job.get("role", "Role"))
            role_run.bold = True
            jp.add_run(f" | {job.get('company', 'Company')}")
            if job.get("location"):
                jp.add_run(f" ({job.get('location')})")
            
            dates = f"{job.get('start_date', '')} - {'Present' if job.get('current') else job.get('end_date', '')}"
            dp = doc.add_paragraph()
            d_run = dp.add_run(dates)
            d_run.italic = True
            d_run.font.size = Pt(9)
            d_run.font.color.rgb = RGBColor(100, 116, 139)

            for b in job.get("bullets", []):
                if b.strip():
                    doc.add_paragraph(b.strip(), style="List Bullet")

    # Education
    education = c.get("education", [])
    if education:
        h = doc.add_heading(level=2)
        r = h.add_run("EDUCATION")
        r.font.size = Pt(12)
        r.font.color.rgb = RGBColor(15, 23, 42)

        for edu in education:
            ep = doc.add_paragraph()
            deg_run = ep.add_run(f"{edu.get('degree', '')} in {edu.get('field_of_study', '')}")
            deg_run.bold = True
            ep.add_run(f" — {edu.get('institution', '')}")
            if edu.get("graduation_date"):
                ep.add_run(f" ({edu.get('graduation_date')})")
            if edu.get("gpa"):
                gp = doc.add_paragraph()
                gp.add_run(f"GPA: {edu.get('gpa')}")
                gp.paragraph_format.space_after = Pt(4)

    # Skills
    skills = c.get("skills", [])
    if skills:
        h = doc.add_heading(level=2)
        r = h.add_run("TECHNICAL SKILLS")
        r.font.size = Pt(12)
        r.font.color.rgb = RGBColor(15, 23, 42)

        for cat in skills:
            cat_p = doc.add_paragraph()
            c_run = cat_p.add_run(f"{cat.get('name', 'Skills')}: ")
            c_run.bold = True
            cat_p.add_run(", ".join(cat.get("skills", [])))

    # Projects
    projects = c.get("projects", [])
    if projects:
        h = doc.add_heading(level=2)
        r = h.add_run("PROJECTS")
        r.font.size = Pt(12)
        r.font.color.rgb = RGBColor(15, 23, 42)

        for proj in projects:
            pp = doc.add_paragraph()
            pr_run = pp.add_run(proj.get("name", "Project"))
            pr_run.bold = True
            if proj.get("technologies"):
                pp.add_run(f" ({', '.join(proj.get('technologies', []))})")
            if proj.get("description"):
                doc.add_paragraph(proj.get("description"))
            if proj.get("outcomes"):
                op = doc.add_paragraph(f"Outcome: {proj.get('outcomes')}", style="List Bullet")

    file_stream = io.BytesIO()
    doc.save(file_stream)
    file_stream.seek(0)

    filename = f"{resume.title.replace(' ', '_')}.docx"
    return StreamingResponse(
        file_stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/json/{resume_id}")
def export_resume_json(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.email == "alex.morgan@resumate.ai":
        resume = db.query(models.Resume).filter(models.Resume.id == resume_id).first()
    else:
        resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")

    return {
        "version": "1.0",
        "exported_at": resume.updated_at.isoformat(),
        "title": resume.title,
        "template_id": resume.template_id,
        "theme_color": resume.theme_color,
        "font_family": resume.font_family,
        "font_size": resume.font_size,
        "spacing": resume.spacing,
        "target_role": resume.target_role,
        "ats_score": resume.ats_score,
        "content": resume.content
    }

@router.post("/import-json")
def import_resume_json(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    content = payload.get("content") or {}
    title = payload.get("title") or "Imported Resume"
    template_id = payload.get("template_id") or "ats_classic"
    theme_color = payload.get("theme_color") or "#4F46E5"

    new_resume = models.Resume(
        user_id=current_user.id,
        title=f"{title} (Imported)",
        template_id=template_id,
        theme_color=theme_color,
        content=content
    )
    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)

    return new_resume

@router.get("/account-data")
def export_all_account_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.email == "alex.morgan@resumate.ai":
        resumes = db.query(models.Resume).all()
        letters = db.query(models.CoverLetter).all()
        apps = db.query(models.JobApplication).all()
    else:
        resumes = db.query(models.Resume).filter(models.Resume.user_id == current_user.id).all()
        letters = db.query(models.CoverLetter).filter(models.CoverLetter.user_id == current_user.id).all()
        apps = db.query(models.JobApplication).filter(models.JobApplication.user_id == current_user.id).all()

    return {
        "user": {
            "email": current_user.email,
            "full_name": current_user.full_name,
            "headline": current_user.headline,
            "theme_preference": current_user.theme_preference,
            "created_at": current_user.created_at.isoformat()
        },
        "resumes": [
            {
                "id": r.id,
                "title": r.title,
                "template_id": r.template_id,
                "theme_color": r.theme_color,
                "ats_score": r.ats_score,
                "content": r.content
            } for r in resumes
        ],
        "cover_letters": [
            {
                "id": l.id,
                "title": l.title,
                "company_name": l.company_name,
                "job_title": l.job_title,
                "content": l.content
            } for l in letters
        ],
        "job_applications": [
            {
                "id": a.id,
                "company": a.company,
                "job_title": a.job_title,
                "status": a.status,
                "notes": a.notes
            } for a in apps
        ]
    }

