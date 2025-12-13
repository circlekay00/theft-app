import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function EditReportModal({ open, report, onClose, onSave }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [categories, setCategories] = useState([]);
  const [offenders, setOffenders] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [offender, setOffender] = useState("");
  const [policeReport, setPoliceReport] = useState("");
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    if (report) {
      setCategoryId(report.categoryId || "");
      setSubcategory(report.subcategory || "");
      setOffender(report.offender || "");
      setPoliceReport(report.fields?.policeReport || "");
      setAdminComment(report.adminComment || "");
    }
  }, [report]);

  async function loadLookups() {
    const catSnap = await getDocs(collection(db, "categories"));
    setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const offSnap = await getDocs(collection(db, "offenders"));
    setOffenders(offSnap.docs.map(d => d.data().name));
  }

  if (!report) return null;

  const subcategories =
    categories.find(c => c.id === categoryId)?.subcategories || [];

  function handleSave() {
    onSave({
      ...report,
      categoryId,
      subcategory,
      offender,
      adminComment,
      fields: {
        ...report.fields,
        policeReport,
      },
    });
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>Edit Report</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            fullWidth
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Subcategory"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            fullWidth
            disabled={!categoryId}
          >
            {subcategories.map((s, i) => (
              <MenuItem key={i} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Offender"
            value={offender}
            onChange={(e) => setOffender(e.target.value)}
            fullWidth
          >
            <MenuItem value="">None</MenuItem>
            {offenders.map((o) => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Police Report"
            value={policeReport}
            onChange={(e) => setPoliceReport(e.target.value)}
            fullWidth
          />

          <TextField
            label="Admin Comment"
            value={adminComment}
            onChange={(e) => setAdminComment(e.target.value)}
            fullWidth
            multiline
            rows={3}
          />
        </Stack>
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
