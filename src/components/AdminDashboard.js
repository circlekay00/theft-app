import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Stack,
  Tooltip,
  Button
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";

import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import EditReportModal from "./EditReportModal";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const catSnap = await getDocs(collection(db, "categories"));
    const catMap = {};
    catSnap.forEach(d => (catMap[d.id] = d.data().name));
    setCategories(catMap);

    const repSnap = await getDocs(collection(db, "reports"));
    const list = repSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      categoryName: catMap[d.data().categoryId] || "—"
    }));

    setReports(list);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this report?")) return;
    await deleteDoc(doc(db, "reports", id));
    loadData();
  }

  async function toggleStatus(r) {
    await updateDoc(doc(db, "reports", r.id), {
      status: r.status === "Complete" ? "Pending" : "Complete"
    });
    loadData();
  }

  function exportCSV() {
    const rows = filtered.map(r => ({
      Category: r.categoryName,
      Offender: r.offender || "",
      PoliceReport: r.fields?.policeReport || "",
      Status: r.status,
      Details: r.fields?.Details || ""
    }));

    const csv =
      "Category,Offender,Police Report,Status,Details\n" +
      rows.map(r =>
        `"${r.Category}","${r.Offender}","${r.PoliceReport}","${r.Status}","${r.Details.replace(/"/g, '""')}"`
      ).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reports.csv";
    a.click();
  }

  const filtered = reports.filter(r => {
    const q = search.toLowerCase();
    return (
      (!search ||
        r.offender?.toLowerCase().includes(q) ||
        r.fields?.Details?.toLowerCase().includes(q)) &&
      (!statusFilter || r.status === statusFilter) &&
      (!categoryFilter || r.categoryId === categoryFilter)
    );
  });

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Admin Dashboard
      </Typography>

      {/* TOOLBAR */}
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 1, flexWrap: "wrap", alignItems: "center" }}
      >
        <TextField
          size="small"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          sx={{ minWidth: 110 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Complete">Complete</MenuItem>
        </TextField>

        <TextField
          size="small"
          select
          label="Category"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {Object.entries(categories).map(([id, name]) => (
            <MenuItem key={id} value={id}>{name}</MenuItem>
          ))}
        </TextField>

        <Button
          size="small"
          startIcon={<DownloadIcon />}
          onClick={exportCSV}
        >
          Export
        </Button>
      </Stack>

      {/* TABLE */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Offender</TableCell>
                <TableCell>Police Report</TableCell>
                <TableCell>Status</TableCell>
                <TableCell sx={{ width: "50%" }}>Details</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.categoryName}</TableCell>
                    <TableCell>{r.offender || "—"}</TableCell>
                    <TableCell>{r.fields?.policeReport || "—"}</TableCell>
                    <TableCell>{r.status}</TableCell>

                    <TableCell>
                      <Tooltip title={r.fields?.Details || ""} arrow>
                        <span
                          style={{
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {r.fields?.Details || "—"}
                        </span>
                      </Tooltip>
                    </TableCell>

                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setSelected(r)}>
                        <EditIcon fontSize="inherit" />
                      </IconButton>

                      <IconButton size="small" onClick={() => toggleStatus(r)}>
                        {r.status === "Complete" ? "↺" : "✓"}
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(r.id)}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No reports found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      {selected && (
        <EditReportModal
          open
          report={selected}
          onClose={() => setSelected(null)}
          onSaved={loadData}
        />
      )}
    </Box>
  );
}
