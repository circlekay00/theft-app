import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  useMediaQuery
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

export default function EditReportModal({ open, onClose, report }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [categories, setCategories] = useState([]);
  const [offenders, setOffenders] = useState([]);

  const [categoryId, setCategoryId] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [offender, setOffender] = useState("");
  const [policeReport, setPoliceReport] = useState("");
  const [details, setDetails] = useState("");
  const [adminComment, setAdminComment] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    if (!open || !report) return;

    setCategoryId(report.categoryId || "");
    setSubcategory(report.subcategory || "");
    setOffender(report.offender || "");
    setPoliceReport(report.fields?.policeReport || "");
    setDetails(report.fields?.Details || ""); // ✅ FIX
    setAdminComment(report.adminComment || "");
    setStatus(report.status || "Pending");
  }, [open, report]);

  useEffect(() => {
    loadCategories();
    loadOffenders();
  }, []);

  async function loadCategories() {
    const snap = await getDocs(collection(db, "categories"));
    setCategories(
      snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
    );
  }

  async function loadOffenders() {
    const snap = await getDocs(collection(db, "offenders"));
    setOffenders(snap.docs.map(d => d.data().name));
  }

  async function handleSave() {
    await updateDoc(doc(db, "reports", report.id), {
      categoryId,
      subcategory,
      offender,
      status,
      adminComment,
      updatedAt: serverTimestamp(),
      fields: {
        ...report.fields,
        policeReport,
        Details: details // ✅ FIX
      }
    });

    onClose();
  }

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Report</DialogTitle>

      <DialogContent>
        <Stack spacing={1.2} sx={{ mt: 1 }}>

          <TextField
            select
            label="Category"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
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
            onChange={e => setSubcategory(e.target.value)}
            fullWidth
          >
            {selectedCategory?.subcategories?.map((s, i) => (
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
            fullWidth
          >
            <MenuItem value="">None</MenuItem>
            {offenders.map(o => (
              <MenuItem key={o} value={o}>
                {o}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Police Report #"
            value={policeReport}
            onChange={e => setPoliceReport(e.target.value)}
            fullWidth
          />

          {/* ✅ DETAILS FIXED */}
          <TextField
            label="Details"
            value={details}
            onChange={e => setDetails(e.target.value)}
            fullWidth
            multiline
            rows={4}
          />

          <TextField
            select
            label="Status"
            value={status}
            onChange={e => setStatus(e.target.value)}
            fullWidth
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Complete">Complete</MenuItem>
          </TextField>

          <TextField
            label="Admin Comment"
            value={adminComment}
            onChange={e => setAdminComment(e.target.value)}
            fullWidth
            multiline
            rows={2}
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
