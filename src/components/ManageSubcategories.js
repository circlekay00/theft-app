// src/components/ManageSubcategories.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc
} from "firebase/firestore";

import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Paper
} from "@mui/material";

export default function ManageSubcategories() {
  const [categories, setCategories] = useState([]);
  const [selectedCatId, setSelectedCatId] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [newSub, setNewSub] = useState("");

  // Load categories (name + subcategories array)
  useEffect(() => {
    async function loadCats() {
      const snap = await getDocs(collection(db, "categories"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        name: d.data().name,
        subcategories: d.data().subcategories || []
      }));
      setCategories(list);
    }
    loadCats();
  }, []);

  // When category changes, load its subcategories
  useEffect(() => {
    const cat = categories.find((c) => c.id === selectedCatId);
    setSubcategories(cat ? cat.subcategories : []);
  }, [selectedCatId, categories]);

  async function saveSubcategories() {
    if (!selectedCatId) return;

    const ref = doc(db, "categories", selectedCatId);

    await updateDoc(ref, { subcategories });

    alert("Saved!");
  }

  function addSub() {
    if (newSub.trim() === "") return;
    setSubcategories([...subcategories, newSub.trim()]);
    setNewSub("");
  }

  function removeSub(name) {
    setSubcategories(subcategories.filter((s) => s !== name));
  }

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: "auto", mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Manage Subcategories
      </Typography>

      {/* Category Selector */}
      <TextField
        select
        fullWidth
        label="Select Category"
        value={selectedCatId}
        onChange={(e) => setSelectedCatId(e.target.value)}
        sx={{ mb: 2 }}
      >
        {categories.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>

      {/* Subcategory List */}
      {selectedCatId && (
        <>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Subcategories
          </Typography>

          {subcategories.map((s) => (
            <Box
              key={s}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 1,
                border: "1px solid #ddd",
                borderRadius: 1,
                p: 1
              }}
            >
              <Typography>{s}</Typography>
              <Button color="error" size="small" onClick={() => removeSub(s)}>
                Delete
              </Button>
            </Box>
          ))}

          <TextField
            fullWidth
            value={newSub}
            onChange={(e) => setNewSub(e.target.value)}
            placeholder="New subcategory"
            sx={{ mb: 2, mt: 2 }}
          />

          <Button variant="contained" onClick={addSub} sx={{ mr: 1 }}>
            Add
          </Button>

          <Button variant="outlined" onClick={saveSubcategories}>
            Save Changes
          </Button>
        </>
      )}
    </Paper>
  );
}
