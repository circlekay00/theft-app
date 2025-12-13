import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";

export default function EditReportModal({ open, onClose, report, onSave }) {
  const [offender, setOffender] = useState("");
  const [details, setDetails] = useState("");
  const [policeReport, setPoliceReport] = useState("");
  const [storeNumber, setStoreNumber] = useState("");
  const [status, setStatus] = useState("Pending");
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    if (!report) return;

    const f = report.fields || {};

    setOffender(f.offender || report.offender || "");
    setDetails(f.Details || report.Details || "");
    setPoliceReport(f.policeReport || report.policeReport || "");
    setStoreNumber(f["Store Number"] || report["Store Number"] || "");
    setStatus(report.status || "Pending");
    setAdminComment(report.adminComment || "");
  }, [report]);

  const handleSave = () => {
    onSave(report, {
      offender,
      details,
      policeReport,
      storeNumber,
      status,
      adminComment,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Report</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Offender"
          value={offender}
          onChange={(e) => setOffender(e.target.value)}
          fullWidth
        />

        <TextField
          label="Store Number"
          value={storeNumber}
          onChange={(e) => setStoreNumber(e.target.value)}
          fullWidth
        />

        <TextField
          label="Details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />

        <TextField
          label="Police Report"
          value={policeReport}
          onChange={(e) => setPoliceReport(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
        >
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Complete">Complete</MenuItem>
        </TextField>

        {/* Admin Comment */}
        <TextField
          label="Admin Comment"
          value={adminComment}
          onChange={(e) => setAdminComment(e.target.value)}
          multiline
          rows={3}
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
