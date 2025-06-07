from fastapi import FastAPI, UploadFile, File, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from app.gemini_integration import parse_resume_with_gemini, match_job_with_resume
from app.job_search import search_jobs_by_skills
import io
import pdfplumber
import docx
import tempfile

app = FastAPI()

# CORS setup (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Job Search Bot API is running."}

@app.post("/upload_resume/")
async def upload_resume(file: UploadFile = File(...)):
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
                    return {"error": "Unsupported file type. Please upload a text, PDF, or DOCX resume."}
        except Exception as e:
            return {"error": f"Resume extraction failed: {str(e)}"}
    if not text or not text.strip():
        return {"error": "Could not extract text from resume. Please upload a valid text, PDF, or DOCX file."}
    parsed = parse_resume_with_gemini(text)
    return {"filename": file.filename, "parsed": parsed}

@app.post("/search_jobs/")
async def search_jobs(skills: list[str] = Query(...), location: str = None):
    """
    Search for jobs based on a list of skills and optional location.
    """
    jobs = search_jobs_by_skills(skills, location)
    return {"results": jobs}

@app.post("/match_job/")
async def match_job(job_description: str = Body(...), resume_data: dict = Body(...)):
    """
    Use Gemini to score the relevance of a job description to the parsed resume data.
    """
    score = match_job_with_resume(job_description, resume_data)
    return {"score": score}
