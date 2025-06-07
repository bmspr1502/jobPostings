from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

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
    # Placeholder for resume parsing logic
    return {"filename": file.filename, "status": "uploaded"}
