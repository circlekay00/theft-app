import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  MenuItem,
  Button,
  Typography,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export default function ReportForm() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [offenders, setOffenders] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [offender, setOffender] = useState("");

  const [storeNumber, setStoreNumber] = useState("");
  const [userStore, setUserStore] = useState("");

  const [details, setDetails] = useState("");
  const [policeReport, setPoliceReport] = useState("");

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ---------------- LOAD BASE DATA ----------------
  useEffect(() => {
    const loadBaseData = async () => {
      const user = auth.currentUser;

      // Only admins/superadmins load categories/offenders
      if (user?.email) {
        try {
          const catSnap = await getDocs(collection(db, "categories"));
          setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

          const offSnap = await getDocs(collection(db, "offenders"));
          setOffenders(offSnap.docs.map(d => d.data().name));
        } catch (err) {
          console.error("Failed to load categories/offenders:", err.message);
        }
      }

      // Always stop loading
      setLoading(false);
    };

    loadBaseData();
  }, []);

  // ---------------- LOAD USER STORE ----------------
  useEffect(() => {
    const loadUserStore = async () => {
      const user = auth.currentUser;
      if (!user || !user.email) {
        // Anonymous user — skip Firestore read
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const store = String(snap.data().storeNumber || "").trim();
          setUserStore(store);
          setStoreNumber(store);
        }
      } catch (err) {
        console.error("Failed to load user store:", err.message);
      }
    };

    loadUserStore();
  }, []);

  // ---------------- CATEGORY → SUBCATEGORY ----------------
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategory("");
      return;
    }

    const cat = categories.find(c => c.id === categoryId);
    const subs = Array.isArray(cat?.subcategories) ? cat.subcategories : [];

    setSubcategories(subs);
    setSubcategory("");
  }, [categoryId, categories]);

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId || !subcategory || !offender || !storeNumber || !details) {
      setSnack({
        open: true,
        message: "All required fields must be filled out",
        severity: "error",
      });
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, "reports"), {
        categoryId,
        subcategory,
        offender,
        storeNumber: String(storeNumber).trim(),
        status: "Pending",

        fields: {
          Details: details,
          policeReport: policeReport || "",
        },

        reporterId: auth.currentUser?.uid || "anonymous",
        reporterName: auth.currentUser?.displayName || "User",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setCategoryId("");
      setSubcategory("");
      setOffender("");
      setDetails("");
      setPoliceReport("");

      if (!userStore) {
        setStoreNumber("");
      }

      setSnack({
        open: true,
        message: "Report submitted successfully",
        severity: "success",
      });
    } catch (e) {
      console.error("Failed to submit report:", e.message);
      setSnack({
        open: true,
        message: "Failed to submit report",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h6" mb={2}>
        Submit Incident Report
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            required
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
            onChange={e => setSubcategory(e.target.value)}
            required
            disabled={!subcategories.length}
            helperText={!subcategories.length ? "Select a category first" : ""}
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
            onChange={e => setOffender(e.target.value)}
            required
          >
            {offenders.map((o, i) => (
              <MenuItem key={i} value={o}>
                {o}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Store Number"
            value={storeNumber}
            onChange={e => setStoreNumber(e.target.value)}
            required
            disabled={Boolean(userStore)}
            helperText={userStore ? "Assigned store" : "Enter store number"}
          />

          <TextField
            label="Details"
            value={details}
            onChange={e => setDetails(e.target.value)}
            multiline
            rows={4}
            required
          />

          <TextField
            label="Police Report # (optional)"
            value={policeReport}
            onChange={e => setPoliceReport(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Submit Report"}
          </Button>
        </Stack>
      </form>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
      >
        <Alert severity={snack.severity} sx={{ width: "100%" }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
