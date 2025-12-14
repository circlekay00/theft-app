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
  Chip,
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
import { auth, db } from "../firebase";

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [storeFilter, setStoreFilter] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [categories, setCategories] = useState([]);
  const [stores, setStores] = useState([]);

  const [userRole, setUserRole] = useState("");
  const [userStore, setUserStore] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  // ---------------- LOAD USER ----------------
  useEffect(() => {
    const loadUser = async () => {
      if (!auth.currentUser) return;

      const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserRole(data.role || "");
        setUserStore(String(data.storeNumber || "").trim());
      }
    };

    loadUser();
  }, []);

  // ---------------- LOAD DATA ----------------
  useEffect(() => {
    if (!userRole) return;

    const load = async () => {
      setLoading(true);
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        setCategories(catSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);

        const out = [];
        const storeSet = new Set();

        for (const d of snap.docs) {
          const data = d.data();

          // 🔒 STORE RESTRICTION (admins only)
          if (userRole !== "superadmin") {
            if (String(data.storeNumber || "").trim() !== userStore) continue;
          }

          let categoryName = "";
          if (data.categoryId) {
            const catDoc = await getDoc(doc(db, "categories", data.categoryId));
            if (catDoc.exists()) categoryName = catDoc.data().name || "";
          }

          storeSet.add(String(data.storeNumber || "").trim());

          out.push({
            id: d.id,
            ...data,
            categoryName,
          });
        }

        setStores([...storeSet]);
        setReports(out);
        setFilteredReports(out);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userRole, userStore]);

  // ---------------- SEARCH + FILTER ----------------
  useEffect(() => {
    const txt = search.toLowerCase().trim();

    const filtered = reports.filter(r => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (categoryFilter && r.categoryId !== categoryFilter) return false;
      if (storeFilter && String(r.storeNumber).trim() !== storeFilter) return false;

      if (!txt) return true;

      const combined = `
        ${JSON.stringify(r)}
        ${JSON.stringify(r.fields || {})}
      `.toLowerCase();

      return combined.includes(txt);
    });

    setFilteredReports(filtered);
    setPage(0);
  }, [search, statusFilter, categoryFilter, storeFilter, reports]);

  // ---------------- STATUS TOGGLE ----------------
  const toggleStatus = async (report) => {
    const newStatus = report.status === "Pending" ? "Complete" : "Pending";

    await updateDoc(doc(db, "reports", report.id), {
      status: newStatus,
      updatedAt: new Date(),
    });

    setReports(prev =>
      prev.map(r => r.id === report.id ? { ...r, status: newStatus } : r)
    );

    setFilteredReports(prev =>
      prev.map(r => r.id === report.id ? { ...r, status: newStatus } : r)
    );
  };

  // ---------------- SAVE EDIT ----------------
  const handleSaveEditedReport = async (updatedReport) => {
    await updateDoc(doc(db, "reports", updatedReport.id), {
      status: updatedReport.status,
      offender: updatedReport.offender || "",
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

  // ---------------- EXPORT PDF ----------------
  const exportPDF = () => {
    const docu = new jsPDF("l", "pt", "a4");

    docu.text("Incident Reports", 40, 40);

    autoTable(docu, {
      startY: 70,
      head: [[
        "Date",
        "Store",
        "Category",
        "Subcategory",
        "Status",
        "Offender",
        "Police",
        "Details",
      ]],
      body: filteredReports.map(r => [
        r.createdAt?.toDate?.().toLocaleString() || "",
        r.storeNumber || "",
        r.categoryName,
        r.subcategory || "",
        r.status,
        r.offender || "",
        r.fields?.policeReport || "",
        r.fields?.Details || "",
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
        <Typography variant="caption">
          {filteredReports.length} reports
        </Typography>
      </Stack>

      {/* FILTER BAR */}
      <Paper sx={{ p: 1, mb: 1 }}>
        <Stack
  direction="row"
  spacing={2}
  flexWrap="wrap"
  alignItems="center"
  sx={{
    "& > *": {
      minWidth: 180,
    },
  }}
>

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
              )
            }}
          />

          <TextField
            size="small"
            select
            label="Status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
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
          >
            <MenuItem value="">All</MenuItem>
            {categories.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          {userRole === "superadmin" && (
            <TextField
              size="small"
              select
              label="Store"
              value={storeFilter}
              onChange={e => setStoreFilter(e.target.value)}
            >
              <MenuItem value="">All Stores</MenuItem>
              {stores.map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          )}

          <Button
            size="small"
            variant="contained"
            onClick={exportPDF}
            sx={{ ml: "auto" }}
          >
            Export PDF
          </Button>
        </Stack>
      </Paper>

      {/* TABLE */}
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Store</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Subcategory</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Offender</TableCell>
                  <TableCell>Police</TableCell>
                  <TableCell sx={{ width: "40%" }}>Details</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredReports
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map(r => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.createdAt?.toDate?.().toLocaleString()}</TableCell>
                      <TableCell>{r.storeNumber}</TableCell>
                      <TableCell>{r.categoryName}</TableCell>
                      <TableCell>{r.subcategory || "—"}</TableCell>

                      <TableCell>
                        <Chip
                          clickable
                          label={r.status}
                          size="small"
                          color={r.status === "Complete" ? "success" : "warning"}
                          onClick={() => toggleStatus(r)}
                        />
                      </TableCell>

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

                      <TableCell align="right">
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedReport(r);
                            setEditOpen(true);
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          onClick={async () => {
                            if (!window.confirm("Delete this report?")) return;
                            await deleteDoc(doc(db, "reports", r.id));
                            setReports(p => p.filter(x => x.id !== r.id));
                            setFilteredReports(p => p.filter(x => x.id !== r.id));
                          }}
                        >
                          Delete
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
