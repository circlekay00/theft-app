import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../firebase";

export default function ManageOffenders() {
  const [offenders, setOffenders] = useState([]);
  const [newOffender, setNewOffender] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editOffenderId, setEditOffenderId] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadOffenders();
  }, []);

  const loadOffenders = async () => {
    const q = query(collection(db, "offenders"), orderBy("name", "asc"));
    const snap = await getDocs(q);

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setOffenders(list);
  };

  const addOffender = async () => {
    if (!newOffender.trim()) return;

    await addDoc(collection(db, "offenders"), {
      name: newOffender.trim(),
    });

    setNewOffender("");
    loadOffenders();
  };

  const openEditModal = (off) => {
    setEditOffenderId(off.id);
    setEditName(off.name);
    setEditModalOpen(true);
  };

  const saveOffender = async () => {
    if (!editOffenderId || !editName.trim()) return;

    await updateDoc(doc(db, "offenders", editOffenderId), {
      name: editName.trim(),
    });

    setEditModalOpen(false);
    loadOffenders();
  };

  const deleteOffender = async (off) => {
    if (!window.confirm("Delete this offender?")) return;

    await deleteDoc(doc(db, "offenders", off.id));
    loadOffenders();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Manage Offenders
      </Typography>

      {/* ADD OFFENDER */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography sx={{ mb: 1 }}>Add New Offender</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Offender Name"
            fullWidth
            value={newOffender}
            onChange={(e) => setNewOffender(e.target.value)}
            size="small"
          />

          <Button variant="contained" onClick={addOffender}>
            Add
          </Button>
        </Box>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Offender Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {offenders.map((off) => (
              <TableRow key={off.id}>
                <TableCell>{off.name}</TableCell>

                <TableCell align="right">
                  <IconButton sx={{ mr: 1 }} color="warning" onClick={() => openEditModal(off)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton color="error" onClick={() => deleteOffender(off)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      {/* EDIT MODAL */}
      <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <DialogTitle>Edit Offender</DialogTitle>

        <DialogContent>
          <TextField
            label="Offender Name"
            fullWidth
            sx={{ mt: 1 }}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            size="small"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={saveOffender}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
