import re
from typing import Dict, Any, List
from app.schemas import ATSResult, ATSIssue

STRONG_ACTION_VERBS = {
    "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered",
    "advanced", "advised", "analyzed", "architected", "automated", "built", "centralized",
    "championed", "collaborated", "conceived", "consolidated", "constructed", "coordinated",
    "created", "delivered", "deployed", "designed", "developed", "devised", "directed",
    "doubled", "drove", "eliminated", "enabled", "engineered", "enhanced", "established",
    "executed", "expanded", "expedited", "fabricated", "facilitated", "formulated",
    "founded", "generated", "guided", "implemented", "improved", "increased", "initiated",
    "innovated", "installed", "instituted", "integrated", "introduced", "launched",
    "led", "managed", "maximized", "mentored", "migrated", "minimized", "modernized",
    "negotiated", "optimized", "orchestrated", "organized", "overhauled", "pioneered",
    "planned", "programmed", "published", "re-engineered", "rebuilt", "reduced",
    "refactored", "resolved", "restructured", "revitalized", "scaled", "secured",
    "simplified", "spearheaded", "standardized", "streamlined", "strengthened",
    "supervised", "surpassed", "synthesized", "trained", "transformed", "upgraded"
}

WEAK_PHRASES = [
    "responsible for", "duties included", "helped with", "assisted in", "worked on",
    "tasked with", "handled", "participated in"
]

def analyze_resume_ats(content: Dict[str, Any], target_role: str = "") -> ATSResult:
    issues: List[ATSIssue] = []
    section_scores: Dict[str, int] = {
        "contact_info": 100,
        "summary": 100,
        "experience": 100,
        "skills": 100,
        "education": 100,
        "formatting": 100
    }

    # 1. Contact Information Checks
    p_info = content.get("personal_info", {})
    name = (p_info.get("full_name") or "").strip()
    email = (p_info.get("email") or "").strip()
    phone = (p_info.get("phone") or "").strip()
    location = (p_info.get("location") or "").strip()
    linkedin = (p_info.get("linkedin") or "").strip()

    if not name:
        section_scores["contact_info"] -= 30
        issues.append(ATSIssue(
            id="ci_missing_name",
            section="contact_info",
            severity="critical",
            title="Missing Full Name",
            description="Applicant tracking systems require your name at the top of your resume header.",
            fix_action="navigate",
            fix_data={"section": "personal_info", "field": "full_name"}
        ))
    else:
        issues.append(ATSIssue(
            id="ci_passed_name",
            section="contact_info",
            severity="passed",
            title="Full Name Present",
            description=f"Applicant name '{name}' is clearly formatted."
        ))

    if not email or "@" not in email or "." not in email:
        section_scores["contact_info"] -= 30
        issues.append(ATSIssue(
            id="ci_invalid_email",
            section="contact_info",
            severity="critical",
            title="Missing or Invalid Email",
            description="Recruiters and automated parsers rely on a valid email to contact you.",
            fix_action="navigate",
            fix_data={"section": "personal_info", "field": "email"}
        ))
    else:
        issues.append(ATSIssue(
            id="ci_passed_email",
            section="contact_info",
            severity="passed",
            title="Valid Contact Email",
            description="Professional email address provided."
        ))

    if not phone:
        section_scores["contact_info"] -= 20
        issues.append(ATSIssue(
            id="ci_missing_phone",
            section="contact_info",
            severity="warning",
            title="Phone Number Missing",
            description="Adding a telephone number helps recruiters reach you for quick screening calls.",
            fix_action="navigate",
            fix_data={"section": "personal_info", "field": "phone"}
        ))

    if not location:
        section_scores["contact_info"] -= 10
        issues.append(ATSIssue(
            id="ci_missing_location",
            section="contact_info",
            severity="suggestion",
            title="Location / City Missing",
            description="Specify your City, State or Country to match geo-targeted applicant filters.",
            fix_action="navigate",
            fix_data={"section": "personal_info", "field": "location"}
        ))

    if not linkedin:
        section_scores["contact_info"] -= 10
        issues.append(ATSIssue(
            id="ci_missing_linkedin",
            section="contact_info",
            severity="suggestion",
            title="LinkedIn Profile Link Omitted",
            description="Over 87% of technical recruiters review LinkedIn profiles during ATS pre-screening.",
            fix_action="navigate",
            fix_data={"section": "personal_info", "field": "linkedin"}
        ))

    # 2. Summary Section Checks
    summary = (content.get("summary") or "").strip()
    words = summary.split()
    if not summary:
        section_scores["summary"] = 40
        issues.append(ATSIssue(
            id="sum_missing",
            section="summary",
            severity="warning",
            title="Professional Summary Missing",
            description="A concise 3-4 sentence professional summary provides critical context and keyword density.",
            fix_action="generate_summary",
            fix_data={"section": "summary"}
        ))
    elif len(words) < 25:
        section_scores["summary"] = 70
        issues.append(ATSIssue(
            id="sum_short",
            section="summary",
            severity="warning",
            title="Summary Is Too Brief",
            description=f"Your summary is only {len(words)} words. Aim for 35 to 65 impactful words highlighting core competencies.",
            fix_action="improve_summary",
            fix_data={"section": "summary"}
        ))
    elif len(words) > 120:
        section_scores["summary"] = 75
        issues.append(ATSIssue(
            id="sum_long",
            section="summary",
            severity="suggestion",
            title="Summary Is Excessively Long",
            description=f"Your summary is {len(words)} words. Busy recruiters scan summaries in under 6 seconds; keep it tight.",
            fix_action="improve_summary",
            fix_data={"section": "summary"}
        ))
    else:
        issues.append(ATSIssue(
            id="sum_passed",
            section="summary",
            severity="passed",
            title="Optimal Summary Length",
            description=f"Summary contains {len(words)} well-balanced words."
        ))

    # 3. Work Experience Checks
    experience = content.get("experience", [])
    if not experience:
        section_scores["experience"] = 50
        issues.append(ATSIssue(
            id="exp_missing",
            section="experience",
            severity="critical",
            title="No Work Experience Listed",
            description="ATS algorithms prioritize verified employment or internship history.",
            fix_action="navigate",
            fix_data={"section": "experience"}
        ))
    else:
        total_bullets = 0
        metric_bullets = 0
        weak_bullet_count = 0
        action_verb_bullets = 0

        metric_pattern = re.compile(r'\b\d+(?:\.\d+)?%|\$\d+|\b\d+(?:,\d+)*(?:\+)?\b|\b(?:increased|decreased|reduced|saved|grew|scaled|doubled)\b', re.IGNORECASE)

        for job in experience:
            bullets = job.get("bullets", [])
            total_bullets += len(bullets)
            for b in bullets:
                b_text = b.strip()
                if not b_text:
                    continue
                first_word = re.sub(r'[^a-zA-Z]', '', b_text.split()[0]).lower() if b_text.split() else ""
                if first_word in STRONG_ACTION_VERBS:
                    action_verb_bullets += 1

                for weak in WEAK_PHRASES:
                    if weak in b_text.lower():
                        weak_bullet_count += 1
                        break

                if metric_pattern.search(b_text):
                    metric_bullets += 1

        if total_bullets == 0:
            section_scores["experience"] -= 35
            issues.append(ATSIssue(
                id="exp_no_bullets",
                section="experience",
                severity="critical",
                title="Missing Bullet Points in Experience",
                description="Experience roles lack bullet points outlining your contributions.",
                fix_action="navigate",
                fix_data={"section": "experience"}
            ))
        else:
            # Check metrics
            metric_pct = (metric_bullets / total_bullets) * 100
            if metric_pct < 30:
                section_scores["experience"] -= 20
                issues.append(ATSIssue(
                    id="exp_low_metrics",
                    section="experience",
                    severity="warning",
                    title="Low Quantifiable Metrics in Experience",
                    description=f"Only {metric_bullets} of {total_bullets} bullet points contain quantifiable numbers, percentages, or metrics.",
                    fix_action="enhance_bullets",
                    fix_data={"section": "experience"}
                ))
            else:
                issues.append(ATSIssue(
                    id="exp_metrics_passed",
                    section="experience",
                    severity="passed",
                    title="Strong Measurable Results",
                    description=f"{metric_bullets} bullet points ({int(metric_pct)}%) quantify business impact with figures and results."
                ))

            # Check weak verbs
            if weak_bullet_count > 0:
                section_scores["experience"] -= 15
                issues.append(ATSIssue(
                    id="exp_weak_phrases",
                    section="experience",
                    severity="warning",
                    title="Passive Phrasing Detected",
                    description=f"Found {weak_bullet_count} bullet(s) using passive phrases like 'responsible for' instead of dynamic action verbs.",
                    fix_action="enhance_bullets",
                    fix_data={"section": "experience"}
                ))

            # Action verbs
            action_pct = (action_verb_bullets / total_bullets) * 100
            if action_pct > 60:
                issues.append(ATSIssue(
                    id="exp_action_passed",
                    section="experience",
                    severity="passed",
                    title="Active Voice & Strong Verbs",
                    description=f"{action_verb_bullets} bullet points begin with industry-standard power action verbs."
                ))

    # 4. Technical Skills Checks
    skills_cats = content.get("skills", [])
    all_skills = []
    for cat in skills_cats:
        all_skills.extend(cat.get("skills", []))

    if len(all_skills) < 5:
        section_scores["skills"] = 55
        issues.append(ATSIssue(
            id="skills_too_few",
            section="skills",
            severity="warning",
            title="Insufficient Key Skills Listed",
            description=f"Only {len(all_skills)} skill(s) listed. Top ATS matches typically feature 10-20 relevant hard skills and tools.",
            fix_action="suggest_skills",
            fix_data={"section": "skills"}
        ))
    elif len(all_skills) > 40:
        section_scores["skills"] = 80
        issues.append(ATSIssue(
            id="skills_too_many",
            section="skills",
            severity="suggestion",
            title="Skill Keyword Overstuffing",
            description=f"{len(all_skills)} skills listed. ATS parsers penalize keyword stuffing; categorize into curated domains.",
            fix_action="navigate",
            fix_data={"section": "skills"}
        ))
    else:
        issues.append(ATSIssue(
            id="skills_passed",
            section="skills",
            severity="passed",
            title="Solid Skill Portfolio",
            description=f"{len(all_skills)} skills organized into clear categorical groups."
        ))

    # 5. Education Section Checks
    education = content.get("education", [])
    if not education:
        section_scores["education"] = 60
        issues.append(ATSIssue(
            id="edu_missing",
            section="education",
            severity="warning",
            title="Education Section Empty",
            description="Most enterprise ATS filters filter out profiles without verified degree or academic credentials.",
            fix_action="navigate",
            fix_data={"section": "education"}
        ))
    else:
        has_institution = any(e.get("institution") for e in education)
        has_degree = any(e.get("degree") for e in education)
        if not has_institution or not has_degree:
            section_scores["education"] -= 25
            issues.append(ATSIssue(
                id="edu_incomplete",
                section="education",
                severity="critical",
                title="Incomplete Degree or School Name",
                description="Ensure both University/College name and Degree title are specified.",
                fix_action="navigate",
                fix_data={"section": "education"}
            ))
        else:
            issues.append(ATSIssue(
                id="edu_passed",
                section="education",
                severity="passed",
                title="Academic Credentials Verified",
                description="Institution and degree requirements satisfied."
            ))

    # 6. Overall formatting and length
    projects = content.get("projects", [])
    if not projects and not experience:
        section_scores["formatting"] -= 20
        issues.append(ATSIssue(
            id="proj_missing",
            section="formatting",
            severity="warning",
            title="No Technical Projects or Experience",
            description="Include technical projects showcasing practical application of your skills.",
            fix_action="navigate",
            fix_data={"section": "projects"}
        ))
    elif projects:
        issues.append(ATSIssue(
            id="proj_passed",
            section="formatting",
            severity="passed",
            title="Demonstrated Projects",
            description=f"{len(projects)} practical projects with technologies and outcomes included."
        ))

    # Calculate overall weighted score
    for k in section_scores:
        section_scores[k] = max(0, min(100, section_scores[k]))

    weighted_score = int(
        section_scores["contact_info"] * 0.15 +
        section_scores["summary"] * 0.15 +
        section_scores["experience"] * 0.35 +
        section_scores["skills"] * 0.20 +
        section_scores["education"] * 0.10 +
        section_scores["formatting"] * 0.05
    )

    passed_count = sum(1 for i in issues if i.severity == "passed")
    crit_count = sum(1 for i in issues if i.severity == "critical")
    warn_count = sum(1 for i in issues if i.severity == "warning")
    sug_count = sum(1 for i in issues if i.severity == "suggestion")

    if weighted_score >= 85:
        summary_text = "Excellent ATS Readiness! Your resume has clear section headers, quantifiable bullet points, and high keyword compatibility."
    elif weighted_score >= 70:
        summary_text = "Good ATS Baseline. Addressing the highlighted critical and warning items will significantly increase your interview callback rate."
    else:
        summary_text = "Needs Optimization. Your resume is missing key contact details, metrics, or essential sections that automated ATS scanners scan for."

    return ATSResult(
        score=weighted_score,
        total_checks=len(issues),
        passed_checks=passed_count,
        critical_count=crit_count,
        warning_count=warn_count,
        suggestion_count=sug_count,
        issues=issues,
        section_scores=section_scores,
        summary_feedback=summary_text
    )

