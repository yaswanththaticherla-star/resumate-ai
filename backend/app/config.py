import os
from dotenv import load_dotenv, dotenv_values

# In production (e.g. Render Web Service), environment variables are injected into os.environ.
# In local development, locate backend/.env and root .env dynamically.
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_env_path = os.path.join(backend_dir, ".env")
root_env_path = os.path.join(os.path.dirname(backend_dir), ".env")

project_root = os.path.dirname(backend_dir)

if os.path.exists(backend_env_path):
    load_dotenv(backend_env_path, override=True)

if os.path.exists(root_env_path):
    root_vals = dotenv_values(root_env_path)
    for k, v in root_vals.items():
        if v and v.strip() and not os.environ.get(k, "").strip():
            os.environ[k] = v.strip()
    load_dotenv(root_env_path)

load_dotenv()  # Fallback to current working directory

# Resolve canonical SQLite path if default or relative
_raw_db = (os.getenv("DATABASE_URL") or "").strip()
if not _raw_db or _raw_db == "sqlite:///./resumate.db" or _raw_db.startswith("sqlite:///."):
    canonical_sqlite = os.path.join(project_root, "resumate.db").replace("\\", "/")
    DEFAULT_DATABASE_URL = f"sqlite:///{canonical_sqlite}"
else:
    DEFAULT_DATABASE_URL = _raw_db

class Settings:
    PROJECT_NAME: str = (os.getenv("PROJECT_NAME") or "ResuMate AI").strip()
    DATABASE_URL: str = DEFAULT_DATABASE_URL
    SECRET_KEY: str = (os.getenv("SECRET_KEY") or "resumate-super-secret-production-grade-key-2026").strip()
    ALGORITHM: str = (os.getenv("ALGORITHM") or "HS256").strip()
    
    _raw_expire = (os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES") or "").strip()
    try:
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(_raw_expire) if _raw_expire else 60 * 24 * 7
    except ValueError:
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # Primary AI Provider: Groq
    GROQ_API_KEY: str = (os.getenv("GROQ_API_KEY") or "").strip()
    GROQ_MODEL: str = (os.getenv("GROQ_MODEL") or "llama-3.3-70b-versatile").strip()

    # Fallback AI Provider: Google Gemini
    GEMINI_API_KEY: str = (os.getenv("GEMINI_API_KEY") or "").strip()
    GEMINI_MODEL: str = (os.getenv("GEMINI_MODEL") or "gemini-2.5-flash").strip()

    # Optional tertiary provider: OpenAI
    OPENAI_API_KEY: str = (os.getenv("OPENAI_API_KEY") or "").strip()

    @property
    def has_groq(self) -> bool:
        """Returns True if a non-empty Groq API key is configured."""
        return bool(self.GROQ_API_KEY)

    @property
    def has_gemini(self) -> bool:
        """Returns True if a non-empty Gemini API key is configured."""
        return bool(self.GEMINI_API_KEY)

    @property
    def has_openai(self) -> bool:
        """Returns True if a non-empty OpenAI API key is configured."""
        return bool(self.OPENAI_API_KEY)

settings = Settings()
