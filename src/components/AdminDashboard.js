import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  CircularProgress,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import ReportCard from "./ReportCard";
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

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [categories, setCategories] = useState([]);

  // ---------------- LOAD DATA ----------------
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

  // ---------------- SEARCH + FILTER ----------------
  useEffect(() => {
    const txt = search.toLowerCase().trim();

    const from = dateFrom ? new Date(dateFrom + "T00:00:00") : null;
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null;

    const filtered = reports.filter(r => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (categoryFilter && r.categoryId !== categoryFilter) return false;

      if (from || to) {
        const created = r.createdAt?.toDate ? r.createdAt.toDate() : null;
        if (!created) return false;
        if (from && created < from) return false;
        if (to && created > to) return false;
      }

      if (!txt) return true;

      const f = r.fields || {};
      const combined = `
  ${JSON.stringify(r)}
`.toLowerCase();


      return combined.includes(txt);
    });

    setFilteredReports(filtered);
  }, [search, statusFilter, categoryFilter, dateFrom, dateTo, reports]);

  // ---------------- ACTIONS ----------------
  const handleEdit = report => {
    setSelectedReport(report);
    setEditOpen(true);
  };

  const handleDelete = async report => {
    if (!window.confirm("Delete this report?")) return;
    await deleteDoc(doc(db, "reports", report.id));
    setReports(p => p.filter(r => r.id !== report.id));
    setFilteredReports(p => p.filter(r => r.id !== report.id));
  };

  const handleToggleStatus = async report => {
    const newStatus = report.status === "Complete" ? "Pending" : "Complete";
    await updateDoc(doc(db, "reports", report.id), { status: newStatus });
    setReports(p => p.map(r => r.id === report.id ? { ...r, status: newStatus } : r));
    setFilteredReports(p => p.map(r => r.id === report.id ? { ...r, status: newStatus } : r));
  };

  const handleSaveEditedReport = async (original, updated) => {
    const ref = doc(db, "reports", original.id);

    const updates = {
      adminComment: updated.adminComment ?? original.adminComment,
      status: updated.status ?? original.status,
      updatedAt: new Date(),
    };

    await updateDoc(ref, updates);

    setReports(p => p.map(r => r.id === original.id ? { ...r, ...updates } : r));
    setFilteredReports(p => p.map(r => r.id === original.id ? { ...r, ...updates } : r));

    setEditOpen(false);
    setSelectedReport(null);
  };

  // ---------------- PDF EXPORT ----------------
  const exportPDF = () => {
    const doc = new jsPDF("l", "pt", "a4");

    const d = new Date();
    const name = `CK_AZ${String(d.getDate()).padStart(2,"0")}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getFullYear()).slice(2)}.pdf`;

    doc.setFontSize(14);
    doc.text("Incident Reports", 40, 40);

    const rows = filteredReports.map(r => {
      const f = r.fields || {};
      return [
        r.id,
        r.createdAt?.toDate?.().toLocaleString() || "",
        r.categoryName,
        r.subcategory,
        r.status,
        f.offender || "",
        f["Store Number"] || "",
        f.Details || "",
        f.policeReport || "",
        r.adminComment || "",
      ];
    });

    autoTable(doc, {
      startY: 70,
      head: [[
        "ID","Created","Category","Subcat","Status",
        "Offender","Store","Details","Police","Admin Comment"
      ]],
      body: rows,
      styles: { fontSize: 8, cellPadding: 4 },
      headStyles: { fillColor: [30,30,30], textColor: 255 },
      columnStyles: {
        7: { cellWidth: 180 },
        9: { cellWidth: 150 },
      },
      pageBreak: "auto",
    });

    doc.save(name);
  };

  // ---------------- UI ----------------
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>Admin Dashboard</Typography>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search reports…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Complete">Complete</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {categories.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          sx={{ minWidth: 140 }}
          type="date"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
        />

        <TextField
          size="small"
          sx={{ minWidth: 140 }}
          type="date"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={dateTo}
          onChange={e => setDateTo(e.target.value)}
        />

        <Button variant="contained" size="small" onClick={exportPDF}>
          Export PDF
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {filteredReports.map(r => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
              <ReportCard
                report={r}
                onEdit={() => handleEdit(r)}
                onDelete={() => handleDelete(r)}
                onToggleStatus={() => handleToggleStatus(r)}
              />
            </Grid>
          ))}
        </Grid>
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
