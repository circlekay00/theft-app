// AdminCommentModal.js
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";

export default function AdminCommentModal({ open, onClose, report, onSaveComment }) {
  const [comment, setComment] = useState(report.adminComment || "");

  const handleSave = () => {
    onSaveComment(report.id, comment);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Admin Comment</DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <TextField
          label="Admin Comment"
          fullWidth
          multiline
          minRows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Comment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
