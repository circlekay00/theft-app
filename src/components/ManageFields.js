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

export default function ManageFields() {
  const [fields, setFields] = useState([]);
  const [newFieldName, setNewFieldName] = useState("");

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFieldId, setEditFieldId] = useState(null);
  const [editFieldName, setEditFieldName] = useState("");

  useEffect(() => {
    loadFields();
  }, []);

  const loadFields = async () => {
    const q = query(collection(db, "fields"), orderBy("name", "asc"));
    const snap = await getDocs(q);

    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setFields(list);
  };

  const addField = async () => {
    if (!newFieldName.trim()) return;

    await addDoc(collection(db, "fields"), {
      name: newFieldName.trim(),
    });

    setNewFieldName("");
    loadFields();
  };

  const openEditModal = (field) => {
    setEditFieldId(field.id);
    setEditFieldName(field.name);
    setEditModalOpen(true);
  };

  const saveField = async () => {
    if (!editFieldId || !editFieldName.trim()) return;

    await updateDoc(doc(db, "fields", editFieldId), {
      name: editFieldName.trim(),
    });

    setEditModalOpen(false);
    loadFields();
  };

  const deleteField = async (field) => {
    if (!window.confirm("Delete this field?")) return;

    await deleteDoc(doc(db, "fields", field.id));
    loadFields();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        Manage Custom Fields
      </Typography>

      {/* ADD FIELD */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography sx={{ mb: 1 }}>Add New Custom Field</Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="Field Name"
            fullWidth
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            size="small"
          />

          <Button variant="contained" onClick={addField}>
            Add
          </Button>
        </Box>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Field Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {fields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>{field.name}</TableCell>

                <TableCell align="right">
                  <IconButton sx={{ mr: 1 }} color="warning" onClick={() => openEditModal(field)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton color="error" onClick={() => deleteField(field)} size="small">
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
        <DialogTitle>Edit Field</DialogTitle>

        <DialogContent>
          <TextField
            label="Field Name"
            fullWidth
            sx={{ mt: 1 }}
            value={editFieldName}
            onChange={(e) => setEditFieldName(e.target.value)}
            size="small"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditModalOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={saveField}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
