import os
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

def parse_resume_with_gemini(resume_text: str) -> dict:
    """
    Send resume text to Gemini API and return parsed information.
    """
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not set"}
    prompt = f"""
    Extract the following from this resume:
    - List of skills
    - Work experience (company, title, years)
    - Education (degree, institution, year)
    Return as JSON with keys: skills, experience, education.
    Resume:
    {resume_text}
    """
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json=data,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        # Extract the model's text response
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        import json as _json
        # Try to parse the response as JSON
        try:
            return _json.loads(text)
        except Exception:
            return {"raw_response": text}
    except Exception as e:
        return {"error": str(e)}


def match_job_with_resume(job_description: str, resume_data: dict) -> float:
    """
    Use Gemini API to score job description relevance to resume data.
    Returns a float between 0 and 1 (higher is better match).
    """
    if not GEMINI_API_KEY:
        return 0.0
    prompt = f"""
    Given the following resume data (as JSON) and a job description, rate how well the resume matches the job on a scale from 0 (no match) to 1 (perfect match). Only return the score as a float between 0 and 1.
    Resume Data:
    {resume_data}
    Job Description:
    {job_description}
    """
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
            json=data,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        text = result["candidates"][0]["content"]["parts"][0]["text"]
        try:
            # Try to parse the float directly
            return float(text.strip())
        except Exception:
            # Fallback: try to extract a float from the response
            import re
            match = re.search(r"([01](?:\.\d+)?)", text)
            if match:
                return float(match.group(1))
            return 0.0
    except Exception:
        return 0.0
