// src/components/OffenderManager.js
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";

export default function OffenderManager() {
  const [offenders, setOffenders] = useState([]);
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    loadOffenders();
  }, []);

  const loadOffenders = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "offenders"));
      setOffenders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return alert("Enter name");
    await addDoc(collection(db, "offenders"), { name: newName.trim() });
    setNewName("");
    setAddOpen(false);
    loadOffenders();
  };

  const openEdit = (o) => {
    setEditing({ ...o });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    await updateDoc(doc(db, "offenders", editing.id), { name: editing.name });
    setEditOpen(false);
    setEditing(null);
    loadOffenders();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete offender?")) return;
    await deleteDoc(doc(db, "offenders", id));
    loadOffenders();
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: "#ff9100", mb: 1 }}>Manage Offenders</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAddOpen(true)} sx={{ background: "#ff6f00" }}>Add Offender</Button>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {offenders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.name}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEdit(o)}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(o.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth>
        <DialogTitle>Add Offender</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={newName} onChange={(e) => setNewName(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Offender</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={editing?.name || ""} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}