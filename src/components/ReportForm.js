// src/components/ReportForm.js
import { useEffect, useState } from "react";
import {
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Stack,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function ReportForm() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subcategories, setSubcategories] = useState([]);

  const [offenders, setOffenders] = useState([]);
  const [selectedOffender, setSelectedOffender] = useState("");

  const [fields, setFields] = useState([]);
  const [fieldValues, setFieldValues] = useState({});
  const [selectedSub, setSelectedSub] = useState("");

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const user = JSON.parse(localStorage.getItem("userData") || "null");

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    loadCategories();
    loadOffenders();
    loadFields();
  }, []);

  async function loadCategories() {
    const snap = await getDocs(collection(db, "categories"));
    setCategories(
      snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        subcategories: d.data().subcategories || [],
      }))
    );
  }

  async function loadOffenders() {
    const snap = await getDocs(collection(db, "offenders"));
    setOffenders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  async function loadFields() {
    const snap = await getDocs(collection(db, "fields"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
      setSnack({
        open: true,
        message: "Please select category and subcategory",
        severity: "warning",
      });
      return;
    }

    try {
      await addDoc(collection(db, "reports"), {
        reporterId: user?.uid || null,
        reporterName: user?.name || "Guest",
        categoryId: selectedCatId,
        subcategory: selectedSub,
        offender: selectedOffender || "",
        fields: fieldValues,
        status: "Pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSnack({
        open: true,
        message: "Report submitted successfully",
        severity: "success",
      });

      setSelectedCatId("");
      setSelectedSub("");
      setSelectedOffender("");

      const reset = {};
      fields.forEach((f) => (reset[f.name] = ""));
      setFieldValues(reset);

    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        message: "Failed to submit report",
        severity: "error",
      });
    }
  }

  return (
    <>
      <Paper
        elevation={isMobile ? 0 : 3}
        sx={{
          p: isMobile ? 2 : 3,
          maxWidth: 600,
          mx: "auto",
          mt: isMobile ? 1 : 3,
          borderRadius: isMobile ? 0 : 2,
        }}
      >
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{ mb: 2, textAlign: "center" }}
        >
          Submit Report
        </Typography>

        <Stack spacing={isMobile ? 1.5 : 2}>
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

          <Button
            variant="contained"
            size={isMobile ? "large" : "medium"}
            fullWidth
            onClick={submitReport}
            sx={{ mt: 1 }}
          >
            Submit Report
          </Button>
        </Stack>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
