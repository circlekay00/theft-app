// src/components/ReportForm.js
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Stack,
} from "@mui/material";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ReportForm() {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subcategories, setSubcategories] = useState([]);

  const [offenders, setOffenders] = useState([]);
  const [selectedOffender, setSelectedOffender] = useState("");

  const [fields, setFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [selectedSub, setSelectedSub] = useState("");

  const user = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    loadCategories();
    loadOffenders();
    loadFields();
  }, []);

  async function loadCategories() {
    const snap = await getDocs(collection(db, "categories"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      name: d.data().name,
      subcategories: d.data().subcategories || [],
    }));
    setCategories(list);
  }

  async function loadOffenders() {
    const snap = await getDocs(collection(db, "offenders"));
    setOffenders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function loadFields() {
    const snap = await getDocs(collection(db, "fields"));
    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    setFields(list);

    const initial = {};
    list.forEach((f) => (initial[f.name] = ""));
    setFieldValues(initial);
  }

  useEffect(() => {
    const cat = categories.find((c) => c.id === selectedCatId);
    setSubcategories(cat ? cat.subcategories : []);
    setSelectedSub("");
  }, [selectedCatId, categories]);

  function updateField(name, value) {
    setFieldValues((prev) => ({ ...prev, [name]: value }));
  }

  async function submitReport() {
    if (!selectedCatId || !selectedSub) {
      alert("Select category & subcategory");
      return;
    }

    await addDoc(collection(db, "reports"), {
      reporterId: user.uid,
      reporterName: user.name,
      categoryId: selectedCatId, // ← IMPORTANT
      subcategory: selectedSub,
      offender: selectedOffender || "",
      fields: fieldValues,
      status: "Pending",
      createdAt: serverTimestamp(),
    });

    alert("Report submitted!");

    setSelectedCatId("");
    setSelectedSub("");
    setSelectedOffender("");

    const reset = {};
    fields.forEach((f) => (reset[f.name] = ""));
    setFieldValues(reset);
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Submit Report
      </Typography>

      <Stack spacing={2}>

        <TextField
          select
          label="Category"
          value={selectedCatId}
          onChange={(e) => setSelectedCatId(e.target.value)}
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
          value={selectedSub}
          onChange={(e) => setSelectedSub(e.target.value)}
          disabled={subcategories.length === 0}
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
          label="Known Offender"
          value={selectedOffender}
          onChange={(e) => setSelectedOffender(e.target.value)}
          fullWidth
        >
          <MenuItem value="">None</MenuItem>
          {offenders.map((o) => (
            <MenuItem key={o.id} value={o.name}>
              {o.name}
            </MenuItem>
          ))}
        </TextField>

        {fields.map((f) => (
          <TextField
            key={f.id}
            label={f.name}
            value={fieldValues[f.name]}
            onChange={(e) => updateField(f.name, e.target.value)}
            fullWidth
            multiline={f.type === "textarea"}
            rows={f.type === "textarea" ? 3 : 1}
          />
        ))}

        <Button variant="contained" onClick={submitReport}>
          Submit Report
        </Button>
      </Stack>
    </Paper>
  );
}
