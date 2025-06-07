# Job Search Bot Backend

This is a Python FastAPI backend for a job search bot. It supports:

- Resume upload and parsing (Gemini API integration)
- Job search aggregation from multiple sources
- Endpoints for job search and resume management

## Setup

1. Create a virtual environment:
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
3. Run the server:
   ```sh
   uvicorn app.main:app --reload
   ```

## Project Structure

- `app/` - Main FastAPI app and modules
- `requirements.txt` - Python dependencies
- `.github/` - Copilot instructions

## Next Steps

- Implement Gemini API integration for resume/job parsing
- Add job board scraping modules
- Build frontend or API client as needed
