# ResuMate AI — Architecture & Technical Specifications

## 1. System Overview
ResuMate AI is an enterprise-grade Smart Resume and Career Builder built following modern full-stack web standards:
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, HTML5 Canvas, jsPDF.
- **Backend**: FastAPI, SQLAlchemy, Pydantic v2, Python-Jose JWT, Passlib/Bcrypt, Python-Docx.
- **Database**: SQLite (local development) / PostgreSQL ready schema with automatic migration-free table reflection.
- **AI Engine**: Hybrid architecture supporting direct Gemini API / OpenAI API integration and built-in deterministic ATS natural language heuristics (enabling 100% offline functionality without requiring an external paid API key).

---

## 2. Directory Structure
```
c:\ResuMate AI\
  ├── backend/
  │   ├── app/
  │   │   ├── config.py           # Application settings, JWT configuration, AI provider keys
  │   │   ├── database.py         # SQLAlchemy engine & session maker
  │   │   ├── models.py           # User, Resume, ResumeVersion, CoverLetter, JobApplication, JobMatchAnalysis
  │   │   ├── schemas.py          # Pydantic v2 data transfer models
  │   │   ├── auth.py             # Bcrypt hashing & JWT Bearer authentication
  │   │   ├── routes/             # API routes: auth, resumes, templates, ats, ai, job_match, cover_letters, career_tools, export
  │   │   └── services/           # Deterministic ATS evaluator, Job keyword matcher, AI enhancements, DOCX exporter
  │   ├── requirements.txt        # Backend dependencies
  │   └── .env                    # Local environment variables
  ├── frontend/
  │   ├── src/
  │   │   ├── components/         # Layout (Navbar, Sidebar, AppLayout), Resume Forms, ScoreGauge, Modal
  │   │   ├── context/            # AuthContext, ThemeContext (light/dark mode)
  │   │   ├── pages/              # 9 primary screens + supporting pages
  │   │   ├── services/           # Unified API client
  │   │   └── types/              # Comprehensive TypeScript interfaces
  │   ├── package.json
  │   ├── vite.config.ts
  │   └── tailwind.config.js
  ├── tests/                      # Automated Pytest suite
  ├── docs/                       # Technical documentation
  └── README.md                   # Windows setup & startup guide
```

---

## 3. Data Privacy & Anti-Fabrication Safeguards
1. **Strict Ownership Enforcement**: Every resume, cover letter, and job tracker entry is linked to `user_id` on the database level. Direct access by changing IDs or tokens is prevented.
2. **Anti-Hallucination AI Rules**: The AI Assistant and Cover Letter Generator never fabricate false employers, dates, metrics, degrees, or certifications. Improvements strictly enhance authentic candidate experience using proven Google XYZ action formulas.
3. **Transparent ATS Scoring**: ATS readiness scores (0-100%) are calculated deterministically against transparent rules (contact information presence, section headers, measurable numbers/percentages, action verbs, and layout simplicity).

