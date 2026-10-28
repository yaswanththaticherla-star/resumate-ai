import os
import re
import json
import time
from typing import List, Dict, Any, Optional
import requests
from app.config import settings
from app import schemas
from app.schemas import AISuggestionOut

try:
    from groq import Groq
    import groq
    HAS_GROQ_LIB = True
except ImportError:
    Groq = None  # type: ignore
    groq = None  # type: ignore
    HAS_GROQ_LIB = False

try:
    from google import genai
    from google.genai import errors as genai_errors
    HAS_GENAI_LIB = True
except ImportError:
    genai = None  # type: ignore
    genai_errors = None  # type: ignore
    HAS_GENAI_LIB = False

ACTION_VERB_REPLACEMENTS = {
    "helped with": "facilitated",
    "assisted in": "collaborated to deliver",
    "worked on": "engineered and deployed",
    "responsible for": "spearheaded the design and execution of",
    "tasked with": "orchestrated",
    "handled": "administered and optimized",
    "made": "architected",
    "fixed": "diagnosed and resolved",
    "changed": "modernized and refactored",
    "did": "executed and delivered"
}

def extract_json_from_text(text: str) -> Any:
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass
    match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', text)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    return None

# ----------------- CLIENT INITIALIZATION -----------------

_groq_client: Optional[Any] = None
_gemini_client: Optional[Any] = None

def get_groq_client():
    global _groq_client
    if not settings.has_groq or not HAS_GROQ_LIB or Groq is None:
        return None
    if _groq_client is None:
        try:
            _groq_client = Groq(
                api_key=settings.GROQ_API_KEY,
                timeout=10.0,
                max_retries=1
            )
        except Exception as e:
            print(f"[ResuMate AI] Failed to initialize Groq Client: {type(e).__name__}")
            return None
    return _groq_client

def get_gemini_client():
    global _gemini_client
    if not settings.has_gemini or not HAS_GENAI_LIB or genai is None:
        return None
    if _gemini_client is None:
        try:
            _gemini_client = genai.Client(
                api_key=settings.GEMINI_API_KEY,
                http_options={"timeout": 10000}  # 10s request timeout to prevent hanging
            )
        except Exception as e:
            print(f"[ResuMate AI] Failed to initialize Gemini Client: {type(e).__name__}")
            return None
    return _gemini_client

# ----------------- ERROR CLASSIFICATION -----------------

def classify_groq_error(e: Exception) -> str:
    """Categorize Groq API errors into clear diagnostics."""
    err_str = str(e).lower()
    if "401" in err_str or "auth" in err_str or "unauthorized" in err_str:
        return "Authentication / Invalid API Key"
    elif "404" in err_str or "model_not_found" in err_str:
        return "Model Not Found / Unavailable"
    elif "429" in err_str or "rate_limit" in err_str or "quota" in err_str:
        return "Rate Limit / Quota Exceeded"
    elif "timeout" in err_str:
        return "Timeout"
    elif any(code in err_str for code in ["500", "502", "503", "504", "internal"]):
        return "Server Error"
    return f"Connection / Network Error ({type(e).__name__})"

def classify_gemini_error(e: Exception) -> str:
    """Categorize Gemini API errors into clear diagnostics."""
    err_str = str(e).lower()
    if "401" in err_str or "403" in err_str or "permission" in err_str or "unauthenticated" in err_str:
        return "Authentication / Invalid API Key"
    elif "404" in err_str or "not_found" in err_str:
        return "Unsupported / Retired Model"
    elif "429" in err_str or "resource_exhausted" in err_str or "quota" in err_str:
        return "Quota / Rate Limit Exceeded"
    elif "503" in err_str or "unavailable" in err_str:
        return "High Demand / Service Temporarily Unavailable"
    elif "504" in err_str or "deadline" in err_str or "timeout" in err_str:
        return "Upstream Server Timeout / Deadline Exceeded"
    return f"Network / Provider Error ({type(e).__name__})"

# ----------------- PROVIDER CALLS -----------------

def call_groq(prompt: str, system_message: str = "You are an expert career and resume assistant.") -> Optional[str]:
    """Call Groq API as primary provider with bounded timeout."""
    client = get_groq_client()
    if not client:
        return None

    model_name = settings.GROQ_MODEL or "llama-3.3-70b-versatile"
    models_to_try = [model_name]
    for alt in ["llama-3.1-8b-instant", "qwen/qwen3.8-27b", "llama3-8b-8192"]:
        if alt not in models_to_try:
            models_to_try.append(alt)

    for candidate_model in models_to_try:
        try:
            completion = client.chat.completions.create(
                model=candidate_model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
            )
            if completion.choices and completion.choices[0].message and completion.choices[0].message.content:
                return completion.choices[0].message.content.strip()
        except Exception as e:
            category = classify_groq_error(e)
            err_msg = str(e)
            if settings.GROQ_API_KEY and settings.GROQ_API_KEY in err_msg:
                err_msg = err_msg.replace(settings.GROQ_API_KEY, "[REDACTED_API_KEY]")
            print(f"[ResuMate AI] Groq API [{category}] on {candidate_model}: {err_msg[:120]}")
            if category == "Authentication / Invalid API Key":
                break

    return None

def call_gemini(prompt: str) -> Optional[str]:
    """Call Google Gemini as automatic fallback provider."""
    client = get_gemini_client()
    if not client:
        return None

    model_name = settings.GEMINI_MODEL or "gemini-2.5-flash"
    models_to_try = [model_name]
    for alt in ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"]:
        if alt not in models_to_try:
            models_to_try.append(alt)

    for candidate_model in models_to_try:
        try:
            response = client.models.generate_content(
                model=candidate_model,
                contents=prompt,
            )
            if response and response.text:
                return response.text.strip()
        except Exception as e:
            category = classify_gemini_error(e)
            err_msg = str(e)
            if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY in err_msg:
                err_msg = err_msg.replace(settings.GEMINI_API_KEY, "[REDACTED_API_KEY]")
            print(f"[ResuMate AI] Gemini API [{category}] on {candidate_model}: {err_msg[:120]}")
            if category in ["Authentication / Invalid API Key", "Quota / Rate Limit Exceeded"]:
                break

    return None

def call_cloud_ai_with_meta(prompt: str, system_message: Optional[str] = None) -> Dict[str, Any]:
    """Attempt primary provider (Groq) first; automatically fallback to Gemini if Groq fails or is unconfigured."""
    sys_msg = system_message or "You are an expert career strategist and ATS resume optimization AI."

    # 1. Primary: Groq API
    if settings.has_groq:
        groq_resp = call_groq(prompt, system_message=sys_msg)
        if groq_resp:
            return {
                "text": groq_resp,
                "provider": "Groq",
                "model": settings.GROQ_MODEL,
                "fallback_used": False,
                "error": None
            }
        print("[ResuMate AI] Groq primary provider failed or unavailable. Initiating fallback to Google Gemini...")

    # 2. Fallback: Google Gemini API
    if settings.has_gemini:
        gemini_resp = call_gemini(prompt)
        if gemini_resp:
            return {
                "text": gemini_resp,
                "provider": "Google Gemini",
                "model": settings.GEMINI_MODEL,
                "fallback_used": bool(settings.has_groq),
                "error": None
            }
        print("[ResuMate AI] Google Gemini fallback provider also failed.")

    # 3. Tertiary fallback: OpenAI (if configured)
    if settings.has_openai:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            resp = requests.post(
                url,
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": sys_msg},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7
                },
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                timeout=10
            )
            if resp.ok:
                data = resp.json()
                choices = data.get("choices", [])
                if choices:
                    text = choices[0].get("message", {}).get("content", "")
                    return {
                        "text": text,
                        "provider": "OpenAI",
                        "model": "gpt-4o-mini",
                        "fallback_used": True,
                        "error": None
                    }
        except Exception as e:
            print(f"[ResuMate AI] OpenAI tertiary call failed: {type(e).__name__}")

    if not settings.has_groq and not settings.has_gemini and not settings.has_openai:
        return {
            "text": None,
            "provider": "None",
            "model": "None",
            "fallback_used": False,
            "error": "No AI provider configured"
        }

    return {
        "text": None,
        "provider": "None",
        "model": "None",
        "fallback_used": True,
        "error": "All configured AI providers failed"
    }

def call_cloud_ai(prompt: str) -> Optional[str]:
    """Unified entry point for AI text generation across the application with Groq-first, Gemini-fallback."""
    res = call_cloud_ai_with_meta(prompt)
    return res.get("text")

def get_active_provider_name() -> str:
    if settings.has_groq and settings.has_gemini:
        return f"Groq ({settings.GROQ_MODEL}) with Gemini Fallback"
    elif settings.has_groq:
        return f"Groq ({settings.GROQ_MODEL})"
    elif settings.has_gemini:
        return f"Google Gemini ({settings.GEMINI_MODEL})"
    elif settings.has_openai:
        return "OpenAI GPT-4o-mini"
    return "Local Heuristic NLP Engine"

def handle_chat_request(req: schemas.ChatRequest) -> schemas.ChatResponse:
    """Handle chat conversations with Groq-first and Gemini-fallback."""
    if not settings.has_groq and not settings.has_gemini and not settings.has_openai:
        return schemas.ChatResponse(
            response="AI services are not configured. Please set GROQ_API_KEY or GEMINI_API_KEY in your environment.",
            provider="None",
            model="None",
            fallback_used=False
        )

    system_prompt = (
        "You are an elite career strategist and ATS resume optimization assistant for ResuMate AI. "
        "Provide actionable, professional, and concise guidance."
    )
    if req.target_role:
        system_prompt += f" The candidate is targeting the role: {req.target_role}."
    if req.resume_context:
        system_prompt += f" Context from candidate resume: {req.resume_context[:500]}."

    prompt = req.message
    if req.history:
        hist_lines = []
        for h in req.history[-4:]:
            hist_lines.append(f"{h.role.capitalize()}: {h.content}")
        prompt = f"Conversation History:\n" + "\n".join(hist_lines) + f"\n\nUser: {req.message}"

    res = call_cloud_ai_with_meta(prompt, system_message=system_prompt)
    if res.get("text"):
        return schemas.ChatResponse(
            response=res["text"],
            provider=res["provider"],
            model=res["model"],
            fallback_used=res["fallback_used"]
        )

    return schemas.ChatResponse(
        response="I apologize, but our AI service is temporarily unavailable due to upstream provider rate limits or downtime. Please try again shortly or use our built-in ATS resume tools.",
        provider="None",
        model="None",
        fallback_used=True
    )

def test_groq_single_bounded_call(model_name: Optional[str] = None) -> Dict[str, Any]:
    """Execute a single bounded test request to Groq."""
    client = get_groq_client()
    if not client:
        return {
            "status": "FAIL",
            "model": model_name or settings.GROQ_MODEL,
            "error_category": "Client Uninitialized (missing key or library)",
            "error_message": "GROQ_API_KEY is not configured or groq is not installed.",
            "latency_seconds": 0.0,
            "response_preview": None
        }

    target_model = model_name or settings.GROQ_MODEL or "llama-3.3-70b-versatile"
    start_t = time.time()
    try:
        completion = client.chat.completions.create(
            model=target_model,
            messages=[{"role": "user", "content": "Say 'ResuMate verification OK' in 4 words."}],
            max_tokens=20,
            temperature=0.7
        )
        duration = time.time() - start_t
        text = completion.choices[0].message.content.strip() if completion.choices else ""
        return {
            "status": "PASS",
            "model": target_model,
            "error_category": None,
            "error_message": None,
            "latency_seconds": round(duration, 2),
            "response_preview": text[:100]
        }
    except Exception as e:
        duration = time.time() - start_t
        category = classify_groq_error(e)
        err_msg = str(e)
        if settings.GROQ_API_KEY and settings.GROQ_API_KEY in err_msg:
            err_msg = err_msg.replace(settings.GROQ_API_KEY, "[REDACTED_API_KEY]")
        return {
            "status": "FAIL",
            "model": target_model,
            "error_category": category,
            "error_message": err_msg[:200],
            "latency_seconds": round(duration, 2),
            "response_preview": None
        }

def test_gemini_single_bounded_call(model_name: Optional[str] = None) -> Dict[str, Any]:
    """Execute a single bounded test request to verify Gemini availability without hanging."""
    client = get_gemini_client()
    if not client:
        return {
            "status": "FAIL",
            "model": model_name or settings.GEMINI_MODEL,
            "error_category": "Client Uninitialized (missing key or library)",
            "error_message": "GEMINI_API_KEY is not configured or google-genai is not installed.",
            "latency_seconds": 0.0,
            "response_preview": None
        }

    target_model = model_name or settings.GEMINI_MODEL or "gemini-2.5-flash"
    start_t = time.time()
    try:
        response = client.models.generate_content(
            model=target_model,
            contents="Say 'ResuMate verification OK' in 4 words."
        )
        duration = time.time() - start_t
        text = response.text.strip() if response and response.text else ""
        return {
            "status": "PASS",
            "model": target_model,
            "error_category": None,
            "error_message": None,
            "latency_seconds": round(duration, 2),
            "response_preview": text[:100]
        }
    except Exception as e:
        duration = time.time() - start_t
        category = classify_gemini_error(e)
        err_msg = str(e)
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY in err_msg:
            err_msg = err_msg.replace(settings.GEMINI_API_KEY, "[REDACTED_API_KEY]")
        return {
            "status": "FAIL",
            "model": target_model,
            "error_category": category,
            "error_message": err_msg[:200],
            "latency_seconds": round(duration, 2),
            "response_preview": None
        }


# ----------------- SUMMARY -----------------

def enhance_summary_deterministic(current_summary: str, target_role: str = "", experience_level: str = "Mid-level", tone: str = "Impactful") -> AISuggestionOut:
    cleaned = current_summary.strip()
    if not cleaned:
        role_label = target_role if target_role else "Software Engineer"
        improved = (
            f"Results-driven {role_label} with proven expertise in architecting scalable solutions, "
            f"streamlining end-to-end workflows, and delivering high-impact products. Passionate about solving "
            f"complex technical problems through clean, maintainable architecture and cross-functional collaboration."
        )
        return AISuggestionOut(
            original="",
            improved=improved,
            explanation="Drafted a concise, high-impact summary targeting industry-standard keywords and clear value proposition (Local Heuristic Engine).",
            changes=["Added clear role title", "Emphasized business impact and architecture", "Used active voice"]
        )

    improved = cleaned
    changes = []
    
    for weak, strong in ACTION_VERB_REPLACEMENTS.items():
        pattern = re.compile(re.escape(weak), re.IGNORECASE)
        if pattern.search(improved):
            improved = pattern.sub(strong, improved)
            changes.append(f"Replaced '{weak}' with powerful verb '{strong}'")

    if target_role and target_role.lower() not in improved.lower():
        improved = f"Results-focused {target_role}: {improved}"
        changes.append(f"Prefixed with target role '{target_role}' for ATS visibility")

    if not changes:
        improved = f"{improved} Dedicated to continuous performance optimization and delivering robust, scalable engineering solutions."
        changes.append("Strengthened closing statement focusing on measurable engineering outcomes")

    return AISuggestionOut(
        original=cleaned,
        improved=improved,
        explanation="Enhanced clarity, elevated vocabulary using proven ATS action verbs, and aligned with target role positioning (Local Heuristic Engine).",
        changes=changes if changes else ["Enhanced phrasing and active voice"]
    )

def enhance_summary(current_summary: str, target_role: str = "", experience_level: str = "Mid-level", tone: str = "Impactful") -> AISuggestionOut:
    if settings.has_groq or settings.has_gemini or settings.has_openai:
        prompt = (
            f"You are an executive resume strategist and ATS optimization expert. Improve the following resume professional summary.\n"
            f"Target Role: {target_role or 'Professional'}\n"
            f"Experience Level: {experience_level}\n"
            f"Tone: {tone}\n"
            f"Original Summary: {current_summary or 'No summary provided'}\n\n"
            f"Return ONLY valid JSON with this exact schema:\n"
            f'{{"improved": "<enhanced summary text>", "explanation": "<1-2 sentence explanation of improvements>", "changes": ["<change 1>", "<change 2>"]}}'
        )
        cloud_raw = call_cloud_ai(prompt)
        if cloud_raw:
            parsed = extract_json_from_text(cloud_raw)
            if parsed and isinstance(parsed, dict) and "improved" in parsed:
                provider = get_active_provider_name()
                return AISuggestionOut(
                    original=current_summary,
                    improved=parsed["improved"],
                    explanation=f"Generated via {provider}: {parsed.get('explanation', 'Optimized for ATS visibility.')}",
                    changes=parsed.get("changes", ["Tailored for target role", "Strengthened action verbs"])
                )

    # Local fallback
    res = enhance_summary_deterministic(current_summary, target_role, experience_level, tone)
    return res

# ----------------- BULLETS -----------------

def enhance_bullets_deterministic(bullets: List[str], job_role: str = "", company: str = "") -> List[AISuggestionOut]:
    results = []
    for bullet in bullets:
        cleaned = bullet.strip()
        if not cleaned:
            continue

        improved = cleaned
        changes = []

        for weak, strong in ACTION_VERB_REPLACEMENTS.items():
            pattern = re.compile(re.escape(weak), re.IGNORECASE)
            if pattern.search(improved):
                improved = pattern.sub(strong, improved)
                changes.append(f"Upgraded '{weak}' to '{strong}'")

        if improved and improved[0].islower():
            improved = improved[0].upper() + improved[1:]
            changes.append("Capitalized opening action verb")

        if not improved.endswith("."):
            improved += "."
            changes.append("Added terminal period for grammatical consistency")

        has_metric = bool(re.search(r'\d+%|\$\d+|\b\d+\b', improved))
        if not has_metric:
            changes.append("Tip: Add a quantifiable metric (e.g., 'reducing latency by 25%' or 'serving 10k+ users')")

        results.append(AISuggestionOut(
            original=cleaned,
            improved=improved,
            explanation="Refactored with standard Google XYZ resume format ('Accomplished [X] as measured by [Y] by doing [Z]') (Local Heuristic Engine).",
            changes=changes if changes else ["Applied professional formatting and active phrasing"]
        ))
    return results

def enhance_bullets(bullets: List[str], job_role: str = "", company: str = "") -> List[AISuggestionOut]:
    if (settings.has_groq or settings.has_gemini or settings.has_openai) and bullets:
        prompt = (
            f"You are a tech recruiter and resume editor. Enhance the following resume bullet points using the Google XYZ formula ('Accomplished [X] as measured by [Y] by doing [Z]').\n"
            f"Target Role: {job_role or 'Software Engineer'}\n"
            f"Company: {company or 'Tech Company'}\n"
            f"Bullet Points:\n" + "\n".join(f"- {b}" for b in bullets if b.strip()) + "\n\n"
            f"Return ONLY valid JSON array with schema:\n"
            f'[{{"original": "<original bullet>", "improved": "<enhanced bullet>", "explanation": "<why this is better>", "changes": ["<change 1>"]}}]'
        )
        cloud_raw = call_cloud_ai(prompt)
        if cloud_raw:
            parsed = extract_json_from_text(cloud_raw)
            if parsed and isinstance(parsed, list):
                provider = get_active_provider_name()
                results = []
                for item in parsed:
                    if isinstance(item, dict) and "improved" in item:
                        results.append(AISuggestionOut(
                            original=item.get("original", ""),
                            improved=item.get("improved", ""),
                            explanation=f"Generated via {provider}: {item.get('explanation', 'Google XYZ formula applied.')}",
                            changes=item.get("changes", ["Quantified impact", "Active verb upgrade"])
                        ))
                if results:
                    return results

    return enhance_bullets_deterministic(bullets, job_role, company)

# ----------------- GRAMMAR -----------------

def check_grammar_deterministic(text: str) -> AISuggestionOut:
    cleaned = text.strip()
    if not cleaned:
        return AISuggestionOut(
            original="",
            improved="",
            explanation="No text provided to evaluate.",
            changes=[]
        )

    improved = cleaned
    changes = []

    fixes = [
        (r'\s{2,}', ' ', "Removed redundant double spaces"),
        (r'\s,', ',', "Fixed space before comma"),
        (r'\s\.', '.', "Fixed space before period"),
        (r'\bi\b', 'I', "Capitalized standalone pronoun 'I'"),
        (r'\bteh\b', 'the', "Corrected spelling of 'the'"),
        (r'\brecieve\b', 'receive', "Corrected spelling of 'receive'"),
        (r'\bseperate\b', 'separate', "Corrected spelling of 'separate'"),
        (r'\boccured\b', 'occurred', "Corrected spelling of 'occurred'"),
        (r'\bgoverment\b', 'government', "Corrected spelling of 'government'"),
        (r'\bdefinately\b', 'definitely', "Corrected spelling of 'definitely'")
    ]

    for pattern, repl, desc in fixes:
        if re.search(pattern, improved):
            improved = re.sub(pattern, repl, improved)
            changes.append(desc)

    return AISuggestionOut(
        original=cleaned,
        improved=improved,
        explanation="Scanned for typographical, spacing, and orthographic irregularities (Local Rule-based Checker).",
        changes=changes if changes else ["No obvious spelling or punctuation errors detected"]
    )

def check_grammar(text: str) -> AISuggestionOut:
    if settings.has_groq or settings.has_gemini or settings.has_openai:
        prompt = (
            f"You are an expert copyeditor. Fix all grammar, spelling, punctuation, and awkward phrasing in the following text.\n"
            f"Text: {text}\n\n"
            f"Return ONLY valid JSON:\n"
            f'{{"improved": "<corrected text>", "explanation": "<summary of corrections>", "changes": ["<correction 1>", "<correction 2>"]}}'
        )
        cloud_raw = call_cloud_ai(prompt)
        if cloud_raw:
            parsed = extract_json_from_text(cloud_raw)
            if parsed and isinstance(parsed, dict) and "improved" in parsed:
                provider = get_active_provider_name()
                return AISuggestionOut(
                    original=text,
                    improved=parsed["improved"],
                    explanation=f"Proofread via {provider}: {parsed.get('explanation', 'Grammar corrected.')}",
                    changes=parsed.get("changes", ["Grammar and spelling corrected"])
                )

    return check_grammar_deterministic(text)

# ----------------- SKILLS -----------------

def suggest_skills_for_role(target_role: str, current_skills: List[str]) -> List[str]:
    role_lower = target_role.lower()
    current_lower = {s.lower() for s in current_skills}

    if settings.has_groq or settings.has_gemini or settings.has_openai:
        prompt = (
            f"List 10 in-demand technical and domain skills for the role '{target_role}'.\n"
            f"Do not include any of these existing skills: {', '.join(current_skills)}\n"
            f"Return ONLY a valid JSON array of strings: [\"Skill 1\", \"Skill 2\", ...]"
        )
        cloud_raw = call_cloud_ai(prompt)
        if cloud_raw:
            parsed = extract_json_from_text(cloud_raw)
            if parsed and isinstance(parsed, list):
                filtered = [str(s).strip() for s in parsed if str(s).strip().lower() not in current_lower]
                if filtered:
                    return filtered[:10]

    skill_maps = {
        "frontend": ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux Toolkit", "Web Performance", "Jest", "GraphQL"],
        "backend": ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "Microservices", "RESTful APIs", "SQLAlchemy", "RabbitMQ"],
        "full stack": ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "REST APIs", "Tailwind CSS", "AWS", "Git"],
        "data": ["Python", "SQL", "Pandas", "PyTorch", "TensorFlow", "Scikit-Learn", "Data Modeling", "Apache Spark", "Tableau"],
        "devops": ["Docker", "Kubernetes", "Terraform", "CI/CD Pipelines", "AWS", "GitHub Actions", "Prometheus", "Linux", "Bash"],
        "mobile": ["React Native", "Flutter", "iOS Development", "Android", "Swift", "Kotlin", "Mobile UI/UX", "State Management"],
        "product": ["Agile / Scrum", "Product Roadmapping", "User Story Mapping", "Jira", "A/B Testing", "Data Analysis", "Figma"]
    }

    matched_catalog = []
    for key, skills in skill_maps.items():
        if key in role_lower:
            matched_catalog.extend(skills)

    if not matched_catalog:
        matched_catalog = skill_maps["full stack"] + ["System Design", "Unit Testing", "CI/CD"]

    suggestions = [s for s in matched_catalog if s.lower() not in current_lower]
    return suggestions[:10]

# ----------------- COVER LETTER -----------------

def generate_cover_letter_content(
    user_name: str,
    user_email: str,
    user_phone: str,
    company_name: str,
    job_title: str,
    recipient_name: Optional[str] = "",
    job_description: Optional[str] = "",
    resume_summary: Optional[str] = "",
    key_skills: Optional[List[str]] = None,
    tone: str = "professional",
    length: str = "standard"
) -> str:
    if settings.has_groq or settings.has_gemini or settings.has_openai:
        prompt = (
            f"You are an expert career counselor. Write a compelling, tailored cover letter.\n"
            f"Candidate Name: {user_name}\n"
            f"Email: {user_email}\n"
            f"Phone: {user_phone}\n"
            f"Company: {company_name}\n"
            f"Job Title: {job_title}\n"
            f"Recipient: {recipient_name or 'Hiring Team'}\n"
            f"Job Description: {job_description or 'Standard requirements'}\n"
            f"Candidate Skills: {', '.join(key_skills or [])}\n"
            f"Tone: {tone}\n"
            f"Length: {length}\n\n"
            f"Write the complete cover letter including formal salutation and signoff. Return ONLY the letter text."
        )
        cloud_raw = call_cloud_ai(prompt)
        if cloud_raw and len(cloud_raw.strip()) > 100:
            return cloud_raw.strip()

    salutation = f"Dear Hiring Team at {company_name},"
    if recipient_name and recipient_name.strip():
        salutation = f"Dear {recipient_name.strip()},"

    skills_str = ", ".join(key_skills[:4]) if key_skills else "modern software engineering and collaborative development"
    
    opening = (
        f"I am writing to express my enthusiastic interest in the {job_title} position at {company_name}. "
        f"With a solid track record in {skills_str}, I am excited about the prospect of bringing my dedication "
        f"and problem-solving skills to your esteemed team."
    )

    body_1 = (
        f"Throughout my career, I have focused on engineering resilient, scalable solutions that drive measurable "
        f"business value. My experience aligns closely with the objectives outlined for {company_name}, particularly in "
        f"leveraging modern best practices to optimize workflows, collaborate cross-functionally, and deliver user-centric applications."
    )

    body_2 = ""
    if length != "concise":
        body_2 = (
            f"What particularly excites me about {company_name} is your commitment to innovation and delivering high-quality "
            f"solutions. I thrive in collaborative environments where continuous learning and technical excellence are prioritized, "
            f"and I am eager to apply my background in {skills_str} to contribute immediately to your product milestones."
        )

    closing = (
        f"Thank you for your time and consideration. I welcome the opportunity to discuss how my experience and passion "
        f"can benefit {company_name}. I look forward to hearing from you regarding next steps."
    )

    signoff = f"Sincerely,\n{user_name}\n{user_email}{' | ' + user_phone if user_phone else ''}"

    paragraphs = [salutation, opening, body_1]
    if body_2:
        paragraphs.append(body_2)
    paragraphs.append(closing)
    paragraphs.append(signoff)

    return "\n\n".join(paragraphs)

# ----------------- LINKEDIN & INTERVIEW -----------------

def generate_linkedin_summary_content(target_role: str, full_name: str, skills: List[str]) -> Dict[str, str]:
    if settings.has_gemini or settings.has_openai:
        skills_str = ", ".join(skills[:6]) if skills else "Software Engineering"
        prompt = (
            f"You are a professional personal branding coach. Generate a high-converting LinkedIn Headline and About section for:\n"
            f"Name: {full_name}\n"
            f"Target Role: {target_role}\n"
            f"Core Competencies: {skills_str}\n\n"
            f"Return ONLY valid JSON with this schema:\n"
            f'{{"headline": "<compelling headline with role and value proposition>", "about": "<professional 2-3 paragraph first-person about section with call to action>"}}'
        )
        raw = call_cloud_ai(prompt)
        if raw:
            parsed = extract_json_from_text(raw)
            if parsed and isinstance(parsed, dict) and "headline" in parsed and "about" in parsed:
                return {
                    "headline": str(parsed["headline"]).strip(),
                    "about": str(parsed["about"]).strip()
                }

    headline = f"{target_role} | Building Scalable Systems & Modern Web Applications"
    skills_str = ", ".join(skills[:5]) if isinstance(skills, list) else str(skills)
    about = (
        f"Hi, I'm {full_name}! I'm a passionate {target_role} dedicated to designing performant, reliable, "
        f"and user-centric applications. Specializing in {skills_str}, I enjoy transforming complex problems "
        f"into elegant, maintainable code.\n\n"
        f"Key Competencies:\n"
        f"• End-to-end full stack architecture and API development\n"
        f"• Cloud deployments, CI/CD automation, and developer tooling\n"
        f"• Collaborative engineering, clean code principles, and rapid delivery\n\n"
        f"Always excited to connect with fellow engineers, founders, and teams building the future of software!"
    )
    return {"headline": headline, "about": about}

def generate_interview_questions_content(
    target_role: str,
    company_name: str,
    skills: List[str],
    projects: List[str]
) -> List[Dict[str, str]]:
    if settings.has_gemini or settings.has_openai:
        prompt = (
            f"Generate 5 realistic, high-impact job interview questions for the role of '{target_role}' at '{company_name}'.\n"
            f"Candidate Skills: {', '.join(skills[:5]) if skills else 'Software Engineering'}\n"
            f"Candidate Projects: {', '.join(projects[:3]) if projects else 'Technical Projects'}\n\n"
            f"Return ONLY a valid JSON array of objects with keys 'category', 'question', 'tip':\n"
            f'[{{"category": "Behavioral", "question": "<question>", "tip": "<practical tip>"}}]'
        )
        raw = call_cloud_ai(prompt)
        if raw:
            parsed = extract_json_from_text(raw)
            if parsed and isinstance(parsed, list) and len(parsed) >= 3:
                validated = []
                for q in parsed:
                    if isinstance(q, dict) and "question" in q and "category" in q:
                        validated.append({
                            "category": str(q.get("category", "General")),
                            "question": str(q.get("question", "")),
                            "tip": str(q.get("tip", "Structure your answer using the STAR method."))
                        })
                if validated:
                    return validated

    sample_skill = skills[0] if skills else "your core technology stack"
    sample_proj = projects[0] if projects else "your recent technical project"
    return [
        {
            "category": "Behavioral",
            "question": f"Can you describe a challenge you encountered while building '{sample_proj}' and how you navigated it?",
            "tip": "Structure your answer using the STAR method: Situation, Task, Action, and Result."
        },
        {
            "category": "Technical Mastery",
            "question": f"How do you evaluate performance bottlenecks and architectural tradeoffs when using {sample_skill}?",
            "tip": "Discuss concurrency, caching, profiling tools, and benchmark comparisons."
        },
        {
            "category": "Cross-Functional Collaboration",
            "question": "Tell us about a time you had to align differing engineering opinions on API contracts or database schema design.",
            "tip": "Focus on data-driven decision making, documentation, and constructive compromise."
        },
        {
            "category": "System Design & Scalability",
            "question": f"For {target_role} at {company_name}, how would you design a fault-tolerant microservice that handles peak traffic spikes?",
            "tip": "Address load balancing, rate limiting, circuit breakers, and database indexing."
        },
        {
            "category": "Cultural & Drive",
            "question": f"Why are you particularly interested in joining {company_name} at this point in your career?",
            "tip": "Reference the company's recent engineering accomplishments and product roadmap."
        }
    ]

