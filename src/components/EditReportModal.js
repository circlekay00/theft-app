// src/components/EditReportModal.js
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
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function EditReportModal({ open, report, onClose, onSave }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [status, setStatus] = useState("Pending");
  const [adminComment, setAdminComment] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [offender, setOffender] = useState("");
  const [fields, setFields] = useState({});

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [offenders, setOffenders] = useState([]);

  // ---------------- LOAD LOOKUPS ----------------
  useEffect(() => {
    const loadLookups = async () => {
      const catSnap = await getDocs(collection(db, "categories"));
      setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const offSnap = await getDocs(collection(db, "offenders"));
      setOffenders(
        offSnap.docs.map(d => ({
          id: d.id,
          name: d.data().name,
        }))
      );
    };

    loadLookups();
  }, []);

  // ---------------- LOAD REPORT ----------------
  useEffect(() => {
    if (!report) return;

    setStatus(report.status || "Pending");
    setAdminComment(report.adminComment || "");
    setCategoryId(report.categoryId || "");
    setSubcategory(report.subcategory || "");
    setOffender(report.offender || "");
    setFields(report.fields || {});
  }, [report]);

  // ---------------- CATEGORY → SUBCATEGORIES ----------------
  useEffect(() => {
    const cat = categories.find(c => c.id === categoryId);
    setSubcategories(cat?.subcategories || []);

    if (subcategory && !cat?.subcategories?.includes(subcategory)) {
      setSubcategory("");
    }
  }, [categoryId, categories]);

  const handleFieldChange = (name, value) => {
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({
      ...report,
      status,
      adminComment,
      categoryId,
      subcategory,
      offender,
      fields: { ...fields },
    });
  };

  if (!report) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Edit Report</DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
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

          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            fullWidth
          >
            {categories.map(c => (
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
            disabled={!subcategories.length}
            fullWidth
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
            {offenders.map(o => (
              <MenuItem key={o.id} value={o.name}>
                {o.name}
              </MenuItem>
            ))}
          </TextField>

          {Object.entries(fields).map(([key, value]) => (
            <TextField
              key={key}
              label={key}
              value={value}
              onChange={(e) => handleFieldChange(key, e.target.value)}
              fullWidth
              multiline={key.toLowerCase().includes("detail")}
              rows={key.toLowerCase().includes("detail") ? 3 : 1}
            />
          ))}

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

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
