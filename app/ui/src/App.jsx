import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from "@mui/material";
import ResumeUpload from "./ResumeUpload";
import ResumeSummary from "./ResumeSummary";
import JobSearch from "./JobSearch";
import JobMatch from "./JobMatch";

const steps = ["Upload Resume", "Search Jobs", "Match Jobs"];

export default function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const handleResumeExtracted = (data) => {
    setResumeData(data);
    setActiveStep(1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 3, borderRadius: 3, bgcolor: "#f5faff" }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          color="primary.main">
          Job Search Bot
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>
          {activeStep === 0 && (
            <ResumeUpload onExtracted={handleResumeExtracted} />
          )}
          {activeStep === 1 && resumeData && (
            <ResumeSummary
              resumeData={resumeData}
              onNext={() => setActiveStep(2)}
            />
          )}
          {activeStep === 2 && resumeData && (
            <JobSearch resumeData={resumeData} onSelectJob={setSelectedJob} />
          )}
          {activeStep === 3 && resumeData && selectedJob && (
            <JobMatch resumeData={resumeData} job={selectedJob} />
          )}
        </Box>
        {activeStep > 0 && (
          <Button sx={{ mt: 3 }} onClick={() => setActiveStep(activeStep - 1)}>
            Back
          </Button>
        )}
      </Paper>
    </Container>
  );
}
