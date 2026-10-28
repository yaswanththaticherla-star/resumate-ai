# ResuMate AI — Smart Resume & Career Builder

A complete, production-grade web application for creating recruiter-approved, ATS-optimized resumes, matching job descriptions, generating tailored cover letters, and tracking career applications.

---

## 🌟 Nine Core Screens & Features

1. **Landing Page**: Modern hero section, template showcase carousel, interactive feature highlights, pricing, and FAQ.
2. **Dashboard**: Welcome widget, quick navigation cards, recent resumes table with real search, template filters, sorting, and action controls (Edit, Rename, Duplicate, Delete).
3. **Resume Editor**: 3-column desktop layout (Left: Section Nav; Center: Editing Forms; Right: Real-time Live Preview), mobile edit/preview tabs, debounced autosave, undo/redo, and color/font pickers.
4. **Template Gallery**: 6 distinct, functional templates:
   - **ATS Classic**: Single-column layout engineered for maximum ATS parser compatibility.
   - **Modern Professional**: Indigo accents, clean timeline markers, date badges.
   - **Software Developer**: Monospace font accents, tech stack pills, direct GitHub and live demo badges.
   - **Student / Fresher**: Prioritizes education, GPA/honors, coursework, and practical projects.
   - **Minimalist**: Scandinavian disciplined whitespace with hairline dividers.
   - **Executive**: Sophisticated navy banner with executive vision callout.
5. **AI Assistant**: Improve summary, enhance bullet points using Google XYZ format, suggest target role skills, and scan for spelling/grammar errors with side-by-side accept/reject controls.
6. **ATS Readiness Checker**: Deterministic 0-100% audit scoring, section breakdowns, severity badges (Critical, Warning, Suggestion, Passed), and one-click "Fix Now" actions.
7. **Cover Letter Builder**: Generate tailored cover letters matching job postings, tone, and length without fabricating experience; with print and PDF download.
8. **Job Description Matcher**: Analyzes job descriptions against resume content, calculates transparent match percentage, and identifies matching vs missing skills.
9. **Resume Preview & Export**: Accurate A4 sheet preview with zoom controls, pixel-perfect PDF export, native Microsoft Word (.DOCX) export, and public link sharing.

---

## 🚀 Windows Setup & Startup Guide

### Prerequisites
- **Node.js**: v18+ (verified with Node v24.19.0)
- **Python**: 3.10+ (verified with Python 3.13)
- **PowerShell**

### Step 1: Clone or Open Workspace
```powershell
cd "C:\ResuMate AI"
```

### Step 2: Start the Backend (Terminal 1)
```powershell
# Set Python path to include backend
$env:PYTHONPATH="backend"

# Run backend API server using the prepared virtual environment
backend\venv\Scripts\uvicorn.exe app.main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will start at: `http://127.0.0.1:8000`  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

### Step 3: Start the Frontend (Terminal 2)
```powershell
cd "C:\ResuMate AI\frontend"
npm run dev
```
The web application will open at: `http://localhost:3000`

---

## 🧪 Automated Testing
Run the backend pytest test suite:
```powershell
$env:PYTHONPATH="backend"
backend\venv\Scripts\pytest.exe tests\test_backend.py -v
```

Run frontend build verification:
```powershell
cd "C:\ResuMate AI\frontend"
npm run build
```

---

## ⚙️ Environment Variables (`.env`)

Configure optional cloud AI keys in `backend/.env`:
```env
PROJECT_NAME="ResuMate AI"
DATABASE_URL="sqlite:///./resumate.db"
SECRET_KEY="resumate-super-secret-production-grade-key-2026"
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Optional: Add keys for cloud LLM inference (built-in intelligent NLP rules run if left blank)
GEMINI_API_KEY=""
OPENAI_API_KEY=""
```

---

## 🛡️ Clickability & Data Integrity Rule
- Every button, dropdown, modal, tab, and card in ResuMate AI is connected to real event handlers and endpoints.
- User data persists across reloads via SQLite and localStorage tokens.
- Cross-user data isolation is strictly enforced on the API layer.

