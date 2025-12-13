import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import EditReportModal from "./EditReportModal";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [categories, setCategories] = useState([]);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const out = [];
        for (const d of snap.docs) {
          const data = d.data();
          let categoryName = "";

          if (data.categoryId) {
            const catDoc = await getDoc(doc(db, "categories", data.categoryId));
            if (catDoc.exists()) categoryName = catDoc.data().name || "";
          }

          out.push({ id: d.id, ...data, categoryName });
        }

        setReports(out);
        setFilteredReports(out);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const txt = search.toLowerCase().trim();

    const filtered = reports.filter(r => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (categoryFilter && r.categoryId !== categoryFilter) return false;
      if (!txt) return true;

      const combined = `
        ${JSON.stringify(r)}
        ${JSON.stringify(r.fields || {})}
      `.toLowerCase();

      return combined.includes(txt);
    });

    setFilteredReports(filtered);
    setPage(0);
  }, [search, statusFilter, categoryFilter, reports]);

  const handleSaveEditedReport = async (updatedReport) => {
    const ref = doc(db, "reports", updatedReport.id);

    await updateDoc(ref, {
      status: updatedReport.status,
      adminComment: updatedReport.adminComment || "",
      fields: { ...updatedReport.fields },
      updatedAt: new Date(),
    });

    setReports(prev =>
      prev.map(r => r.id === updatedReport.id ? updatedReport : r)
    );
    setFilteredReports(prev =>
      prev.map(r => r.id === updatedReport.id ? updatedReport : r)
    );

    setEditOpen(false);
    setSelectedReport(null);
  };

  const exportPDF = () => {
    const docu = new jsPDF("l", "pt", "a4");

    docu.text("Incident Reports", 40, 40);

    autoTable(docu, {
      startY: 70,
      head: [[
        "Date",
        "Category",
        "Status",
        "Offender",
        "Police",
        "Details",
        "Admin Comment"
      ]],
      body: filteredReports.map(r => [
        r.createdAt?.toDate?.().toLocaleString() || "",
        r.categoryName,
        r.status,
        r.fields?.offender || "",
        r.fields?.policeReport || "",
        r.fields?.Details || "",
        r.adminComment || "",
      ]),
      styles: { fontSize: 8 },
    });

    docu.save("reports.pdf");
  };

  return (
    <Box sx={{ p: 1.5, minHeight: "100vh" }}>
      <Stack direction="row" justifyContent="space-between" mb={1}>
        <Typography variant="h6" fontWeight={600}>
          Admin Dashboard
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {filteredReports.length} reports
        </Typography>
      </Stack>

      <Paper sx={{ p: 1, mb: 1, borderRadius: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          <TextField
            size="small"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { fontSize: "0.75rem" }
            }}
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
            {categories.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          <Button
            variant="contained"
            size="small"
            onClick={exportPDF}
            sx={{ ml: "auto" }}
          >
            Export PDF
          </Button>
        </Stack>
      </Paper>

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <Paper sx={{ borderRadius: 2 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "rgba(255,255,255,0.04)" }}>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Offender</TableCell>
                  <TableCell>Police</TableCell>
                  <TableCell sx={{ width: "40%" }}>Details</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredReports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(r => (
                    <TableRow
                      key={r.id}
                      hover
                      sx={{ "& td": { py: 0.6, fontSize: "0.75rem" } }}
                    >
                      <TableCell>
                        {r.createdAt?.toDate?.().toLocaleDateString()}
                      </TableCell>
                      <TableCell>{r.categoryName}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{r.offender || "—"}</TableCell>

                      <TableCell>{r.fields?.policeReport || "—"}</TableCell>

                      <TableCell>
                        <Tooltip title={r.fields?.Details || ""} arrow>
                          <span
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                              maxWidth: "100%"
                            }}
                          >
                            {r.fields?.Details || "—"}
                          </span>
                        </Tooltip>
                      </TableCell>

                      <TableCell>
                        <Button size="small" onClick={() => {
                          setSelectedReport(r);
                          setEditOpen(true);
                        }}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredReports.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 15, 25, 50]}
            sx={{
              "& .MuiTablePagination-toolbar": {
                minHeight: 40,
                fontSize: "0.75rem"
              }
            }}
          />
        </Paper>
      )}

      <EditReportModal
        open={editOpen}
        report={selectedReport}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveEditedReport}
      />
    </Box>
  );
}
