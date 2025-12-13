// src/components/FieldManager.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  MenuItem,
  Select,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

/**
 * FieldManager supports:
 * type: "text" | "number" | "select"
 * options: for select -> ["A", "B"]
 */
export default function FieldManager() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  // dialog states
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null => add

  // form
  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  const [optionsText, setOptionsText] = useState(""); // comma separated for select

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "fields"));
      setFields(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setName("");
    setType("text");
    setOptionsText("");
    setOpen(true);
  };

  const openEdit = (f) => {
    setEditing(f);
    setName(f.name || "");
    setType(f.type || "text");
    setOptionsText((f.options || []).join(", "));
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Enter field name");
    const payload = { name: name.trim(), type };
    if (type === "select") payload.options = optionsText.split(",").map(s => s.trim()).filter(Boolean);

    if (editing) {
      await updateDoc(doc(db, "fields", editing.id), payload);
    } else {
      await addDoc(collection(db, "fields"), payload);
    }
    setOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete field definition?")) return;
    await deleteDoc(doc(db, "fields", id));
    load();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: "#ff9100", mb: 1 }}>Custom Form Fields</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<AddIcon />} variant="contained" onClick={openAdd} sx={{ background: "#ff6f00" }}>Add Field</Button>
          <Button onClick={load}>Refresh</Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Options (select)</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {fields.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.type || "text"}</TableCell>
                <TableCell>{(f.options || []).join(", ")}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEdit(f)}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(f.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>{editing ? "Edit Field" : "Add Field"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Field name" value={name} onChange={(e) => setName(e.target.value)} sx={{ mt: 1 }} />
          <Select fullWidth value={type} onChange={(e) => setType(e.target.value)} sx={{ mt: 1 }}>
            <MenuItem value="text">Text</MenuItem>
            <MenuItem value="number">Number</MenuItem>
            <MenuItem value="select">Select (options)</MenuItem>
          </Select>

          {type === "select" && (
            <TextField fullWidth label="Options (comma separated)" value={optionsText} onChange={(e) => setOptionsText(e.target.value)} sx={{ mt: 1 }} />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}