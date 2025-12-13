// src/components/ManageCategories.js
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { Paper, Typography, TextField, Button, Box, Stack, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "categories"));
      setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addCategory = async () => {
    if (!name.trim()) return alert("Enter a name");
    await addDoc(collection(db, "categories"), { name: name.trim(), subcategories: [] });
    setName("");
    load();
  };

  const editCategory = async (c) => {
    const newName = prompt("Edit category name:", c.name);
    if (newName !== null) {
      await updateDoc(doc(db, "categories", c.id), { name: newName });
      load();
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete category?")) return;
    await deleteDoc(doc(db, "categories", id));
    load();
  };

  return (
    <Box sx={{ p: 2, maxWidth: 900, mx: "auto" }}>
      <Paper sx={{ p: 2, mb: 2, background: "#1e1e1e" }}>
        <Typography variant="h6" sx={{ color: "#ff9100", mb: 1 }}>Manage Categories</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField label="Category name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <Button variant="contained" onClick={addCategory} sx={{ background: "#ff6f00", "&:hover": { background: "#ff9100" } }}>Add</Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, background: "#1e1e1e" }}>
        <Typography sx={{ color: "#ff9100", mb: 1 }}>Existing Categories</Typography>

        {loading && <Typography sx={{ color: "#aaa" }}>Loading...</Typography>}
        {!loading && categories.length === 0 && <Typography sx={{ color: "#aaa" }}>No categories</Typography>}

        <Stack spacing={1}>
          {categories.map((c) => (
            <Paper key={c.id} sx={{ p: 1, background: "#262626", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ color: "#fff" }}>{c.name}</Typography>
              <Box>
                <IconButton size="small" onClick={() => editCategory(c)}><EditIcon /></IconButton>
                <IconButton size="small" onClick={() => deleteCategory(c.id)}><DeleteIcon /></IconButton>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}