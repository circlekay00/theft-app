import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import EditReportModal from "./EditReportModal";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const catSnap = await getDocs(collection(db, "categories"));
    const cats = catSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setCategories(cats);

    const repSnap = await getDocs(collection(db, "reports"));
    const reps = repSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
    }));

    setReports(reps);
  }

  function categoryName(id) {
    return categories.find(c => c.id === id)?.name || "—";
  }

  async function deleteReport(id) {
    if (!window.confirm("Delete this report?")) return;
    await deleteDoc(doc(db, "reports", id));
    setReports(r => r.filter(x => x.id !== id));
  }

  async function toggleStatus(report) {
    const newStatus = report.status === "Complete" ? "Pending" : "Complete";
    await updateDoc(doc(db, "reports", report.id), { status: newStatus });
    setReports(r =>
      r.map(x => (x.id === report.id ? { ...x, status: newStatus } : x))
    );
  }

  async function saveEdit(updated) {
    await updateDoc(doc(db, "reports", updated.id), {
      categoryId: updated.categoryId,
      subcategory: updated.subcategory,
      offender: updated.offender,
      adminComment: updated.adminComment || "",
      fields: updated.fields,
    });

    setReports(r =>
      r.map(x => (x.id === updated.id ? updated : x))
    );
    setEditing(null);
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Admin Dashboard
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          overflowX: "auto",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Subcategory</TableCell>
              <TableCell>Offender</TableCell>
              <TableCell>Store #</TableCell>
              <TableCell>Police Report</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {reports.map((r) => (
              <TableRow key={r.id} hover>
                <TableCell>
                  {r.createdAt?.toDate?.().toLocaleDateString()}
                </TableCell>

                <TableCell>{categoryName(r.categoryId)}</TableCell>
                <TableCell>{r.subcategory}</TableCell>
                <TableCell>{r.offender || "—"}</TableCell>
                <TableCell>{r.fields?.["Store Number"] || "—"}</TableCell>
                <TableCell>{r.fields?.policeReport || "—"}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={r.status}
                    color={r.status === "Complete" ? "success" : "warning"}
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton size="small" onClick={() => setEditing(r)}>
                    <EditIcon fontSize="inherit" />
                  </IconButton>

                  <IconButton size="small" onClick={() => toggleStatus(r)}>
                    <CheckCircleIcon fontSize="inherit" />
                  </IconButton>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => deleteReport(r.id)}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No reports found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EditReportModal
        open={!!editing}
        report={editing}
        onClose={() => setEditing(null)}
        onSave={saveEdit}
      />
    </Box>
  );
}
