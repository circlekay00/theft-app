import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export default function EditPoliceReport({ report, onClose, onUpdated }) {
  const fields = report.fields || {};

  const [policeReport, setPoliceReport] = useState(fields.policeReport || "");
  const [policeReportNumber, setPoliceReportNumber] = useState(
    fields.policeReportNumber || ""
  );

  const handleSave = async () => {
    try {
      const updatedFields = {
        ...fields,
        policeReport,
        policeReportNumber,
      };

      await updateDoc(doc(db, "reports", report.id), {
        fields: updatedFields,
      });

      // Tell parent dashboard to refresh UI
      if (onUpdated) onUpdated(updatedFields);

      onClose();
    } catch (err) {
      console.error("Error saving police report:", err);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Police Report</DialogTitle>
      <DialogContent>

        <TextField
          fullWidth
          margin="normal"
          label="Police Report ID"
          value={policeReport}
          onChange={(e) => setPoliceReport(e.target.value)}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Officer Batch Number (Optional)"
          value={policeReportNumber}
          onChange={(e) => setPoliceReportNumber(e.target.value)}
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
