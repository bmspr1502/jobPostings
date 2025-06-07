import React, { useRef, useState } from "react";
import { Box, Button, Typography, LinearProgress, Alert } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

export default function ResumeUpload({ onExtracted }) {
  const fileInput = useRef();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    setError("");
    setLoading(true);
    const file = fileInput.current.files[0];
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/upload_resume/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.parsed && !res.data.parsed.error) {
        onExtracted(res.data.parsed);
      } else {
        setError(res.data.parsed?.error || "Failed to extract resume data.");
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box textAlign="center">
      <input
        type="file"
        ref={fileInput}
        style={{ display: "none" }}
        accept=".pdf,.doc,.docx,.txt"
      />
      <Button
        variant="contained"
        color="primary"
        startIcon={<CloudUploadIcon />}
        onClick={() => fileInput.current.click()}
        sx={{ mb: 2 }}>
        Upload Resume
      </Button>
      <Button
        variant="outlined"
        sx={{ ml: 2, mb: 2 }}
        onClick={handleUpload}
        disabled={loading}>
        Extract Resume Data
      </Button>
      {loading && <LinearProgress sx={{ mt: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Supported formats: PDF, DOC, DOCX, TXT
      </Typography>
    </Box>
  );
}
