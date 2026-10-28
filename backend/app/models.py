import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    headline = Column(String(255), nullable=True, default="Professional")
    theme_preference = Column(String(50), default="system")
    default_template = Column(String(50), default="ats_classic")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="user", cascade="all, delete-orphan")
    job_applications = relationship("JobApplication", back_populates="user", cascade="all, delete-orphan")
    job_matches = relationship("JobMatchAnalysis", back_populates="user", cascade="all, delete-orphan")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="Untitled Resume")
    template_id = Column(String(50), default="ats_classic")
    theme_color = Column(String(20), default="#4F46E5")
    font_family = Column(String(50), default="Inter")
    font_size = Column(String(20), default="medium")
    spacing = Column(String(20), default="normal")
    is_public = Column(Boolean, default=False)
    share_token = Column(String(100), unique=True, nullable=True, index=True)
    target_role = Column(String(255), nullable=True)
    ats_score = Column(Integer, default=75)
    content = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan", order_by="desc(ResumeVersion.created_at)")
    job_matches = relationship("JobMatchAnalysis", back_populates="resume", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="resume")
    job_applications = relationship("JobApplication", back_populates="resume")

class ResumeVersion(Base):
    __tablename__ = "resume_versions"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False,
        index=True
    )
    version_label = Column(String(100), nullable=False, default="Autosave")
    content = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=utc_now)

    resume = relationship("Resume", back_populates="versions")

class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)
    title = Column(String(255), nullable=False, default="Untitled Cover Letter")
    recipient_name = Column(String(255), nullable=True)
    recipient_title = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=False, default="Target Company")
    job_title = Column(String(255), nullable=False, default="Job Role")
    job_description = Column(Text, nullable=True)
    tone = Column(String(50), default="professional")
    length = Column(String(50), default="standard")
    content = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="cover_letters")
    resume = relationship("Resume", back_populates="cover_letters")

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=True, index=True)
    company = Column(String(255), nullable=False)
    job_title = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    salary_range = Column(String(100), nullable=True)
    status = Column(String(50), default="applied")  # saved, applied, interviewing, offered, rejected
    applied_date = Column(String(50), nullable=True)
    job_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="job_applications")
    resume = relationship("Resume", back_populates="job_applications")

class JobMatchAnalysis(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False, index=True)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    job_description = Column(Text, nullable=False)
    match_score = Column(Integer, nullable=False, default=0)
    matching_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="job_matches")
    resume = relationship("Resume", back_populates="job_matches")
