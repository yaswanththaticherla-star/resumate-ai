from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/templates", tags=["templates"])

TEMPLATES_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "ats_classic",
        "name": "ATS Classic",
        "category": "ATS Standard",
        "description": "Engineered strictly for 99.8% compatibility across Workday, Taleo, Greenhouse, and Lever. Clean single-column layout with standard section headers.",
        "badge": "Highest ATS Pass Rate",
        "recommended_for": "Corporate, Finance, Government, Enterprise Tech",
        "layout": "single-column",
        "features": ["No multi-column traps", "Standardized typography", "Clean bullet formatting", "Scannable contact header"]
    },
    {
        "id": "modern_pro",
        "name": "Modern Professional",
        "category": "Contemporary",
        "description": "Sleek indigo accents with structured visual dividers, date pill badges, and elevated role typography.",
        "badge": "Most Popular",
        "recommended_for": "Product Management, Consulting, Marketing, Engineering Lead",
        "layout": "contemporary-grid",
        "features": ["Subtle accent borders", "Date badges", "Compact metric highlights", "Refined section spacing"]
    },
    {
        "id": "software_dev",
        "name": "Software Developer",
        "category": "Tech Focused",
        "description": "Tailored for software engineers and systems architects. Monospace skill pills, GitHub / live-demo link badges, and tech stack tags for every project.",
        "badge": "Tech & Developer",
        "recommended_for": "Frontend, Backend, Full-Stack, DevOps, Cloud Engineers",
        "layout": "developer-clean",
        "features": ["Monospace tech tags", "Direct repo & demo links", "Categorized skill chips", "Architecture callouts"]
    },
    {
        "id": "student_fresher",
        "name": "Student / Fresher",
        "category": "Early Career",
        "description": "Positions education, academic coursework, and practical capstone projects at the forefront to maximize internship and entry-level impact.",
        "badge": "Internships & Grads",
        "recommended_for": "Undergraduates, Recent Grads, Bootcamp Alumni, Interns",
        "layout": "education-first",
        "features": ["Coursework badges", "GPA & Honors focus", "Project portfolio emphasis", "Extracurriculars"]
    },
    {
        "id": "minimalist",
        "name": "Minimalist",
        "category": "Clean Design",
        "description": "Subtle Scandinavian design principles with disciplined whitespace, delicate hair-line dividers, and high-readability typography.",
        "badge": "Design & Product",
        "recommended_for": "UI/UX Designers, Architects, Creative Directors, Strategists",
        "layout": "minimalist",
        "features": ["Disciplined whitespace", "Hairline dividers", "Ultra-clean hierarchy", "Distraction-free"]
    },
    {
        "id": "executive",
        "name": "Executive",
        "category": "Leadership",
        "description": "Sophisticated navy header banner, executive summary callout, and strategic focus on organizational metrics and governance.",
        "badge": "Director & VP",
        "recommended_for": "VPs, Directors, C-Level, Senior Managers, Founders",
        "layout": "executive-banner",
        "features": ["Two-tone header bar", "Executive summary callout", "Leadership metric focus", "Serif heading styling"]
    }
]

@router.get("", response_model=List[Dict[str, Any]])
def get_templates():
    return TEMPLATES_CATALOG

@router.get("/{template_id}", response_model=Dict[str, Any])
def get_template(template_id: str):
    for t in TEMPLATES_CATALOG:
        if t["id"] == template_id:
            return t
    return TEMPLATES_CATALOG[0]

