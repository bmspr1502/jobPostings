import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";

export default function ResumeSummary({ resumeData, onNext }) {
  return (
    <Box>
      <Typography variant="h6" color="primary" gutterBottom>
        Extracted Resume Data
      </Typography>
      <List>
        <ListItem>
          <ListItemText
            primary="Skills"
            secondary={resumeData.skills?.join(", ") || "-"}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Experience"
            secondary={
              resumeData.experience
                ?.map((e) => `${e.title} at ${e.company} (${e.years} yrs)`)
                .join(", ") || "-"
            }
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Education"
            secondary={
              resumeData.education
                ?.map((e) => `${e.degree} at ${e.institution} (${e.year})`)
                .join(", ") || "-"
            }
          />
        </ListItem>
      </List>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 2 }}
        onClick={onNext}>
        Search Jobs
      </Button>
    </Box>
  );
}
