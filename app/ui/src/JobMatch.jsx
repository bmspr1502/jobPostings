import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import axios from "axios";

export default function JobMatch({ resumeData, job }) {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMatch = async () => {
    setLoading(true);
    setError("");
    setScore(null);
    try {
      const res = await axios.post("http://localhost:8000/match_job/", {
        job_description: job.description,
        resume_data: resumeData,
      });
      setScore(res.data.score);
    } catch (err) {
      setError("Failed to match job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" color="primary" gutterBottom>
        Match Job to Your Resume
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        {job.title} @ {job.company}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {job.location}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {job.description?.slice(0, 300)}...
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={handleMatch}
        disabled={loading}>
        Match
      </Button>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {score !== null && (
        <Alert
          severity={score > 0.7 ? "success" : score > 0.4 ? "warning" : "error"}
          sx={{ mt: 2 }}>
          Match Score: <b>{score}</b>{" "}
          {score > 0.7
            ? "Great match!"
            : score > 0.4
            ? "Possible fit."
            : "Low match."}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}
