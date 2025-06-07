import requests
import logging

def search_jobs_by_skills(skills: list, location: str = None) -> list:
    """
    Aggregate job postings from the Remotive API based on skills and location.
    """
    # Remotive API: https://remotive.com/api/remote-jobs
    params = {}
    if skills:
        params["search"] = " ".join(skills)
    if location:
        params["location"] = location
    try:
        resp = requests.get("https://remotive.com/api/remote-jobs", params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        jobs = data.get("jobs", [])
        # Debug: return the raw API response if no jobs found
        if not jobs:
            return [{"debug": "No jobs found", "params": params, "api_response": data}]
        # Return a simplified job listing
        return [
            {
                "title": job["title"],
                "company": job["company_name"],
                "location": job["candidate_required_location"],
                "url": job["url"],
                "description": job["description"][:200]  # Short preview
            }
            for job in jobs
        ]
    except Exception as e:
        return [{"error": str(e), "params": params}]
