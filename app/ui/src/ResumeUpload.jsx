import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from "axios";

export default function ResumeUpload({ onExtracted }) {
  const fileInput = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [extracted, setExtracted] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setError("");
    setSuccess(false);
    setExtracted(null);
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await axios.post(
          "http://localhost:8000/upload_resume/",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        let parsed = res.data.parsed;
        // If Gemini returns a raw_response, try to parse it as JSON
        if (parsed && parsed.raw_response) {
          try {
            // Remove code block markers if present
            let jsonStr = parsed.raw_response
              .replace(/```json|```/g, "")
              .trim();
            parsed = JSON.parse(jsonStr);
          } catch (e) {
            setError("Could not parse resume data from Gemini response.");
            setLoading(false);
            return;
          }
        }
        if (parsed && !parsed.error) {
          setExtracted(parsed);
          setSuccess(true);
          onExtracted && onExtracted(parsed);
        } else {
          setError(parsed?.error || "Failed to extract resume data.");
        }
      } catch (err) {
        setError("Upload failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Helper to render extracted data in a readable format
  const renderExtracted = () => {
    if (!extracted) return null;
    return (
      <Box sx={{ mt: 3, mb: 2, textAlign: "left" }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Extracted Resume Data
        </Typography>
        {extracted.skills && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Skills:</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
              {extracted.skills.map((skill, idx) => (
                <Chip key={idx} label={skill} color="info" size="small" />
              ))}
            </Box>
          </Box>
        )}
        {extracted.experience && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Experience:</Typography>
            <Box component="ul" sx={{ pl: 2, mb: 1 }}>
              {extracted.experience.map((exp, idx) => (
                <li key={idx}>
                  <Typography variant="body2">
                    {exp.title} at {exp.company} ({exp.years} yrs)
                  </Typography>
                </li>
              ))}
            </Box>
          </Box>
        )}
        {extracted.education && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="subtitle2">Education:</Typography>
            <Box component="ul" sx={{ pl: 2, mb: 1 }}>
              {extracted.education.map((edu, idx) => (
                <li key={idx}>
                  <Typography variant="body2">
                    {edu.degree} at {edu.institution} ({edu.year})
                  </Typography>
                </li>
              ))}
            </Box>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box textAlign="center">
      <input
        type="file"
        ref={fileInput}
        style={{ display: "none" }}
        accept=".pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
      />
      <Button
        variant="contained"
        color={selectedFile ? "success" : "primary"}
        startIcon={<CloudUploadIcon />}
        onClick={() => fileInput.current.click()}
        sx={{ mb: 2 }}
        disabled={loading}>
        {selectedFile ? "File Selected" : "Upload Resume"}
      </Button>
      {selectedFile && (
        <Chip
          label={selectedFile.name}
          color="info"
          size="small"
          sx={{ ml: 1, mb: 2 }}
        />
      )}
      {loading && <LinearProgress sx={{ mt: 2 }} />}
      {success && (
        <Alert
          icon={<CheckCircleIcon fontSize="inherit" />}
          severity="success"
          sx={{ mt: 2 }}>
          Resume uploaded and extracted successfully!
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Supported formats: PDF, DOC, DOCX, TXT
      </Typography>
      {renderExtracted()}
    </Box>
  );
}
