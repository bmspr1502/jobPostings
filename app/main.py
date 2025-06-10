from fastapi import FastAPI, UploadFile, File, Query, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from app.gemini_integration import parse_resume_with_gemini, match_job_with_resume
from app.job_search import search_jobs_by_skills
import io
import pdfplumber
import docx
import tempfile
import logging
from typing import List, Optional
from pydantic import BaseModel

app = FastAPI()

# CORS setup (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class JobSearchRequest(BaseModel):
    skills: List[str]
    location: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "Job Search Bot API is running."}

@app.post("/upload_resume/")
async def upload_resume(file: UploadFile = File(...), request: Request = None):
    try:
        contents = await file.read()
        text = None
        # Try to decode as UTF-8 text
        try:
            text = contents.decode("utf-8")
        except UnicodeDecodeError:
            # Try extracting text from PDF or DOCX
            try:
                suffix = file.filename.split('.')[-1].lower()
                with tempfile.NamedTemporaryFile(delete=False, suffix='.'+suffix) as tmp:
                    tmp.write(contents)
                    tmp.flush()
                    if suffix == 'pdf':
                        with pdfplumber.open(tmp.name) as pdf:
                            text = "\n".join(page.extract_text() or '' for page in pdf.pages)
                    elif suffix in ('docx', 'doc'):
                        doc = docx.Document(tmp.name)
                        text = "\n".join([p.text for p in doc.paragraphs])
                    else:
                        logging.error(f"Unsupported file type: {file.filename}")
                        return {"error": "Unsupported file type. Please upload a text, PDF, or DOCX resume."}
            except Exception as e:
                logging.error(f"Resume extraction failed: {str(e)}")
                return {"error": f"Resume extraction failed: {str(e)}"}
        if not text or not text.strip():
            logging.error("Could not extract text from resume.")
            return {"error": "Could not extract text from resume. Please upload a valid text, PDF, or DOCX file."}
        parsed = parse_resume_with_gemini(text)
        return {"filename": file.filename, "parsed": parsed}
    except Exception as e:
        logging.error(f"Upload failed: {str(e)}")
        return {"error": f"Upload failed: {str(e)}"}

@app.post("/search_jobs/")
async def search_jobs(request: JobSearchRequest):
    """
    Search for jobs based on a list of skills and optional location.
    """
    jobs = search_jobs_by_skills(request.skills, request.location)
    return {"results": jobs}

@app.post("/match_job/")
async def match_job(job_description: str = Body(...), resume_data: dict = Body(...)):
    """
    Use Gemini to score the relevance of a job description to the parsed resume data.
    """
    score = match_job_with_resume(job_description, resume_data)
    return {"score": score}
