from typing import List, Optional, Dict, Any
import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    headline: Optional[str] = None
    avatar_url: Optional[str] = None
    theme_preference: Optional[str] = None
    default_template: Optional[str] = None

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

class UserOut(UserBase):
    id: int
    headline: Optional[str] = None
    avatar_url: Optional[str] = None
    theme_preference: str = "system"
    default_template: str = "ats_classic"
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Resume Content Schemas
class PersonalInfo(BaseModel):
    full_name: str = ""
    headline: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str = ""
    linkedin: str = ""
    github: str = ""
    avatar_url: str = ""

class ExperienceItem(BaseModel):
    id: str
    company: str = ""
    role: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    current: bool = False
    bullets: List[str] = []
    technologies: List[str] = []

class EducationItem(BaseModel):
    id: str
    institution: str = ""
    degree: str = ""
    field_of_study: str = ""
    start_date: str = ""
    graduation_date: str = ""
    gpa: str = ""
    honors: str = ""
    coursework: List[str] = []

class SkillCategory(BaseModel):
    id: str
    name: str = "Technical Skills"
    skills: List[str] = []

class ProjectItem(BaseModel):
    id: str
    name: str = ""
    description: str = ""
    role: str = ""
    technologies: List[str] = []
    outcomes: str = ""
    repo_url: str = ""
    live_url: str = ""

class CertificationItem(BaseModel):
    id: str
    name: str = ""
    issuer: str = ""
    date: str = ""
    expiry_date: str = ""
    credential_id: str = ""
    credential_url: str = ""

class AchievementItem(BaseModel):
    id: str
    title: str = ""
    description: str = ""
    date: str = ""

class LanguageItem(BaseModel):
    id: str
    language: str = ""
    proficiency: str = "Fluent"  # Native, Fluent, Intermediate, Basic

class CustomSectionItem(BaseModel):
    id: str
    title: str = ""
    content: str = ""

class ResumeContent(BaseModel):
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str = ""
    experience: List[ExperienceItem] = []
    education: List[EducationItem] = []
    skills: List[SkillCategory] = []
    projects: List[ProjectItem] = []
    certifications: List[CertificationItem] = []
    achievements: List[AchievementItem] = []
    languages: List[LanguageItem] = []
    custom_sections: List[CustomSectionItem] = []
    section_order: List[str] = [
        "personal_info",
        "summary",
        "experience",
        "education",
        "skills",
        "projects",
        "certifications",
        "achievements",
        "languages",
        "custom_sections"
    ]
    hidden_sections: List[str] = []

class ResumeCreate(BaseModel):
    title: str = "My Professional Resume"
    template_id: str = "ats_classic"
    theme_color: str = "#4F46E5"
    font_family: str = "Inter"
    font_size: str = "medium"
    spacing: str = "normal"
    target_role: Optional[str] = None
    content: Optional[Dict[str, Any]] = None

class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[str] = None
    theme_color: Optional[str] = None
    font_family: Optional[str] = None
    font_size: Optional[str] = None
    spacing: Optional[str] = None
    target_role: Optional[str] = None
    ats_score: Optional[int] = None
    is_public: Optional[bool] = None
    content: Optional[Dict[str, Any]] = None

class ResumeOut(BaseModel):
    id: int
    user_id: int
    title: str
    template_id: str
    theme_color: str
    font_family: str
    font_size: str
    spacing: str
    is_public: bool
    share_token: Optional[str] = None
    target_role: Optional[str] = None
    ats_score: int
    content: Dict[str, Any]
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeVersionOut(BaseModel):
    id: int
    resume_id: int
    version_label: str
    content: Dict[str, Any]
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# ATS Schemas
class ATSIssue(BaseModel):
    id: str
    section: str
    severity: str  # critical, warning, suggestion, passed
    title: str
    description: str
    fix_action: Optional[str] = None
    fix_data: Optional[Dict[str, Any]] = None

class ATSResult(BaseModel):
    score: int
    total_checks: int
    passed_checks: int
    critical_count: int
    warning_count: int
    suggestion_count: int
    issues: List[ATSIssue]
    section_scores: Dict[str, int]
    summary_feedback: str

# Job Match Schemas
class JobMatchRequest(BaseModel):
    resume_id: int
    job_title: str
    company: Optional[str] = ""
    job_description: str

class JobMatchResult(BaseModel):
    id: Optional[int] = None
    match_score: int
    matching_skills: List[str]
    missing_skills: List[str]
    unmentioned_qualifications: List[str]
    relevant_projects: List[str]
    tailoring_suggestions: List[str]
    summary_assessment: str

# Cover Letter Schemas
class CoverLetterCreate(BaseModel):
    title: str = "Cover Letter"
    resume_id: Optional[int] = None
    company_name: str
    job_title: str
    recipient_name: Optional[str] = ""
    recipient_title: Optional[str] = ""
    job_description: Optional[str] = ""
    tone: str = "professional"
    length: str = "standard"
    content: Optional[str] = ""

class CoverLetterUpdate(BaseModel):
    title: Optional[str] = None
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    recipient_name: Optional[str] = None
    recipient_title: Optional[str] = None
    job_description: Optional[str] = None
    tone: Optional[str] = None
    length: Optional[str] = None
    content: Optional[str] = None

class CoverLetterOut(BaseModel):
    id: int
    user_id: int
    resume_id: Optional[int] = None
    title: str
    company_name: str
    job_title: str
    recipient_name: Optional[str] = None
    recipient_title: Optional[str] = None
    job_description: Optional[str] = None
    tone: str
    length: str
    content: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# Job Application Tracker Schemas
class JobApplicationCreate(BaseModel):
    company: str
    job_title: str
    location: Optional[str] = ""
    salary_range: Optional[str] = ""
    status: str = "applied"
    applied_date: Optional[str] = ""
    job_url: Optional[str] = ""
    notes: Optional[str] = ""
    resume_id: Optional[int] = None

class JobApplicationUpdate(BaseModel):
    company: Optional[str] = None
    job_title: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: Optional[str] = None
    applied_date: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    resume_id: Optional[int] = None

class JobApplicationOut(BaseModel):
    id: int
    user_id: int
    resume_id: Optional[int] = None
    company: str
    job_title: str
    location: Optional[str] = None
    salary_range: Optional[str] = None
    status: str
    applied_date: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# AI Assistant Request/Response Schemas
class ImproveSummaryRequest(BaseModel):
    current_summary: str
    target_role: Optional[str] = ""
    experience_level: Optional[str] = "Mid-level"
    tone: Optional[str] = "Impactful"

class EnhanceBulletsRequest(BaseModel):
    bullet_points: List[str]
    job_role: Optional[str] = ""
    company: Optional[str] = ""

class SuggestSkillsRequest(BaseModel):
    target_role: str
    current_skills: List[str] = []

class GrammarCheckRequest(BaseModel):
    text: str
    field_name: Optional[str] = "Text"

class AISuggestionOut(BaseModel):
    original: str
    improved: str
    explanation: str
    changes: List[str] = []

