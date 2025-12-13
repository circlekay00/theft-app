import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  List,
  ListItem,
} from "@mui/material";

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");

  // Load categories from Firestore
  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const data = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(), // contains name + subcategories
      }));
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    await addDoc(collection(db, "categories"), {
      name: newCategory,
      subcategories: [],
    });

    setNewCategory("");
    fetchCategories();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Manage Categories
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <TextField
          label="New Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <Button variant="contained" onClick={addCategory}>
          Add
        </Button>
      </Box>

      {/* Category list */}
      <List>
        {categories.map((cat) => (
          <ListItem key={cat.id}>
            <Card sx={{ width: "100%" }}>
              <CardContent>
                <Typography variant="h6">{cat.name}</Typography>

                <Typography sx={{ mt: 1, fontWeight: "bold" }}>
                  Subcategories:
                </Typography>

                {cat.subcategories?.length > 0 ? (
                  <ul>
                    {cat.subcategories.map((sub, i) => (
                      <li key={i}>{sub}</li>
                    ))}
                  </ul>
                ) : (
                  <Typography>No subcategories</Typography>
                )}
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
