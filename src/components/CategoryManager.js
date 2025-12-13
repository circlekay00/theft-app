// src/components/CategoryManager.js
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

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState(null); // { id, name, subcategories }

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCategoryName.trim()) return alert("Enter category name");
    await addDoc(collection(db, "categories"), { name: newCategoryName.trim(), subcategories: newSubcategory ? [newSubcategory.trim()] : [] });
    setNewCategoryName("");
    setNewSubcategory("");
    setAddOpen(false);
    loadCategories();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete category?")) return;
    await deleteDoc(doc(db, "categories", id));
    loadCategories();
  };

  const openEdit = (cat) => {
    setEditing({ ...cat });
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editing) return;
    const ref = doc(db, "categories", editing.id);
    await updateDoc(ref, { name: editing.name, subcategories: editing.subcategories || [] });
    setEditOpen(false);
    setEditing(null);
    loadCategories();
  };

  const addSubToEditing = () => {
    const sub = prompt("New subcategory name:");
    if (!sub) return;
    setEditing((prev) => ({ ...prev, subcategories: [...(prev.subcategories || []), sub] }));
  };

  const removeSubFromEditing = (index) => {
    setEditing((prev) => {
      const subs = [...(prev.subcategories || [])];
      subs.splice(index, 1);
      return { ...prev, subcategories: subs };
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ color: "#ff9100", mb: 1 }}>Manage Categories</Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setAddOpen(true)} sx={{ background: "#ff6f00" }}>Add Category</Button>
          <Button onClick={loadCategories}>Refresh</Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Subcategories</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{(c.subcategories || []).join(", ")}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEdit(c)}><EditIcon /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(c.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} fullWidth>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Category name" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} sx={{ mt: 1 }} />
          <TextField fullWidth label="Optional first subcategory" value={newSubcategory} onChange={(e) => setNewSubcategory(e.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          {editing && (
            <>
              <TextField fullWidth label="Category name" value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} sx={{ mt: 1 }} />
              <Typography sx={{ mt: 2, mb: 1 }}>Subcategories</Typography>
              {(editing.subcategories || []).map((s, i) => (
                <Paper key={i} sx={{ p: 1, mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>{s}</Box>
                  <IconButton size="small" onClick={() => removeSubFromEditing(i)}><DeleteIcon /></IconButton>
                </Paper>
              ))}
              <Button onClick={addSubToEditing} sx={{ mt: 1 }}>Add Subcategory</Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}