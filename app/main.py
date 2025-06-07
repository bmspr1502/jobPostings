from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from app.gemini_integration import parse_resume_with_gemini
import io

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
    # Read file contents
    contents = await file.read()
    # Attempt to decode as text
    try:
        text = contents.decode("utf-8")
    except UnicodeDecodeError:
        # Fallback for binary files (e.g., PDF, DOCX): return error for now
        return {"error": "Only UTF-8 text resumes are supported in this demo."}
    # Parse resume using Gemini API integration
    parsed = parse_resume_with_gemini(text)
    return {"filename": file.filename, "parsed": parsed}
