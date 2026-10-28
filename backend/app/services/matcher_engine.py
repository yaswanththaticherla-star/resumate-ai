import re
from typing import Dict, Any, List, Set
from app.schemas import JobMatchResult

COMMON_SKILL_KEYWORDS = [
    # Programming & Tech
    "python", "javascript", "typescript", "react", "next.js", "vue", "angular", "node.js",
    "express", "fastapi", "django", "flask", "java", "spring boot", "c++", "c#", ".net",
    "go", "golang", "rust", "ruby", "rails", "php", "laravel", "swift", "kotlin",
    # Databases & Cloud
    "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "sqlite",
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes",
    "terraform", "ci/cd", "github actions", "gitlab", "jenkins", "linux", "nginx",
    # Data & AI
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "data analysis", "power bi", "tableau", "spark",
    # Methods & Architecture
    "rest api", "graphql", "microservices", "system design", "agile", "scrum", "kanban",
    "test driven development", "tdd", "unit testing", "git", "jira", "figma"
]

def extract_tokens(text: str) -> Set[str]:
    cleaned = re.sub(r'[^a-zA-Z0-9+#\.\s-]', ' ', text.lower())
    return set(cleaned.split())

def analyze_job_match(resume_content: Dict[str, Any], job_title: str, job_description: str) -> JobMatchResult:
    jd_lower = job_description.lower()
    
    # 1. Gather all resume text and skills
    resume_skills: Set[str] = set()
    skills_cats = resume_content.get("skills", [])
    for cat in skills_cats:
        for s in cat.get("skills", []):
            resume_skills.add(s.strip().lower())

    resume_text_parts = []
    p_info = resume_content.get("personal_info", {})
    resume_text_parts.append(p_info.get("headline", ""))
    resume_text_parts.append(resume_content.get("summary", ""))

    for exp in resume_content.get("experience", []):
        resume_text_parts.append(exp.get("role", ""))
        resume_text_parts.append(exp.get("company", ""))
        resume_text_parts.extend(exp.get("bullets", []))
        resume_text_parts.extend(exp.get("technologies", []))

    for proj in resume_content.get("projects", []):
        resume_text_parts.append(proj.get("name", ""))
        resume_text_parts.append(proj.get("description", ""))
        resume_text_parts.append(proj.get("outcomes", ""))
        resume_text_parts.extend(proj.get("technologies", []))

    for edu in resume_content.get("education", []):
        resume_text_parts.append(edu.get("degree", ""))
        resume_text_parts.append(edu.get("field_of_study", ""))

    full_resume_text = " ".join(resume_text_parts).lower()

    # 2. Extract keywords from JD
    jd_detected_skills: List[str] = []
    for skill in COMMON_SKILL_KEYWORDS:
        # Check skill presence in JD
        pattern = r'(?:\b|^)' + re.escape(skill) + r'(?:\b|$)'
        if re.search(pattern, jd_lower):
            jd_detected_skills.append(skill)

    # Also detect custom words in JD that look like tech or tools
    custom_words = re.findall(r'\b[A-Z][a-zA-Z0-9+#\.]*\b', job_description)
    for cw in custom_words:
        cw_l = cw.lower()
        if len(cw) >= 3 and cw_l not in ["the", "and", "for", "with", "you", "will", "our", "team", "work", "role"]:
            if cw_l not in jd_detected_skills and cw_l in COMMON_SKILL_KEYWORDS:
                jd_detected_skills.append(cw_l)

    if not jd_detected_skills:
        # If no canned skill detected, pick frequent keywords
        words = re.findall(r'\b[a-zA-Z]{4,15}\b', jd_lower)
        stop_words = {"with", "that", "this", "from", "have", "will", "your", "team", "work", "years", "experience", "role"}
        freq: Dict[str, int] = {}
        for w in words:
            if w not in stop_words:
                freq[w] = freq.get(w, 0) + 1
        top_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)[:8]
        jd_detected_skills = [w[0] for w in top_words]

    # 3. Match against resume
    matching_skills: List[str] = []
    missing_skills: List[str] = []

    for skill in jd_detected_skills:
        # Check if in resume_skills or in full resume text
        in_skills = any(skill == s or skill in s or s in skill for s in resume_skills)
        in_text = skill in full_resume_text
        if in_skills or in_text:
            matching_skills.append(skill.title())
        else:
            missing_skills.append(skill.title())

    # Calculate match score
    total_skills = len(jd_detected_skills)
    if total_skills > 0:
        base_score = int((len(matching_skills) / total_skills) * 100)
    else:
        base_score = 70

    # Role title relevance boost
    if job_title.lower() in full_resume_text or any(w in full_resume_text for w in job_title.lower().split() if len(w) > 3):
        base_score = min(100, base_score + 10)

    match_score = max(25, min(98, base_score))

    # Relevant projects
    relevant_projects = []
    for proj in resume_content.get("projects", []):
        proj_techs = [t.lower() for t in proj.get("technologies", [])]
        overlap = [m.lower() for m in matching_skills if m.lower() in proj_techs or m.lower() in proj.get("description", "").lower()]
        if overlap:
            relevant_projects.append(f"{proj.get('name', 'Project')} (matches: {', '.join(overlap[:3])})")

    # Tailoring suggestions
    tailoring_suggestions = []
    if missing_skills:
        top_missing = ", ".join(missing_skills[:3])
        tailoring_suggestions.append(f"Consider integrating experience or academic coursework involving {top_missing} if you have practical familiarity.")
    
    if job_title.lower() not in (p_info.get("headline", "")).lower():
        tailoring_suggestions.append(f"Align your professional headline with '{job_title}' to improve keyword resonance in employer searches.")
    
    tailoring_suggestions.append("Tailor bullet points in your most recent experience to emphasize problem-solving methods mentioned in this job description.")
    tailoring_suggestions.append("Highlight specific measurable results (e.g. % performance increase, latency reduction, user growth) aligned with this employer's objectives.")

    unmentioned_qualifications = []
    for ms in missing_skills[:4]:
        unmentioned_qualifications.append(f"Familiarity with {ms} workflows and tooling")

    if match_score >= 80:
        summary_assessment = f"Strong Match ({match_score}%). Your resume directly mirrors most core competencies for {job_title}. Minor adjustments to highlight specific tools will maximize your call-back rate."
    elif match_score >= 60:
        summary_assessment = f"Moderate Match ({match_score}%). You possess transferable fundamentals, but {len(missing_skills)} desired keywords from the job posting are missing from your resume."
    else:
        summary_assessment = f"Developing Match ({match_score}%). Several required competencies from this posting are not currently represented in your profile. Review the missing skills list below."

    return JobMatchResult(
        match_score=match_score,
        matching_skills=matching_skills,
        missing_skills=missing_skills,
        unmentioned_qualifications=unmentioned_qualifications,
        relevant_projects=relevant_projects,
        tailoring_suggestions=tailoring_suggestions,
        summary_assessment=summary_assessment
    )

