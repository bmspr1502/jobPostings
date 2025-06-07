import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
} from "@mui/material";
import axios from "axios";

export default function JobSearch({ resumeData, onSelectJob }) {
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setLoading(true);
    setError("");
    setJobs([]);
    try {
      const res = await axios.post("/search_jobs/", null, {
        params: {
          skills: resumeData.skills,
          location,
        },
      });
      if (Array.isArray(res.data.results)) {
        setJobs(res.data.results);
      } else {
        setError("No jobs found.");
      }
    } catch (err) {
      setError("Job search failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" color="primary" gutterBottom>
        Search Jobs by Your Skills
      </Typography>
      <TextField
        label="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        sx={{ mb: 2 }}
        fullWidth
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSearch}
        disabled={loading}>
        Search
      </Button>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      <List>
        {jobs.map((job, idx) => (
          <ListItem
            button
            key={idx}
            onClick={() => onSelectJob(job)}
            alignItems="flex-start">
            <ListItemText
              primary={job.title + " @ " + job.company}
              secondary={
                <span>
                  {job.location}
                  <br />
                  {job.description?.slice(0, 120)}...
                </span>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
