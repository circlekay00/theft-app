// src/components/Register.js
import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeNumber, setStoreNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!name || !email || !password || !storeNumber) {
      setError("All fields are required");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Create auth user
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = cred.user;

      // 2️⃣ Create Firestore user profile
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        storeNumber: storeNumber.trim(),
        role: "admin", // 🔒 ALWAYS admin
        createdAt: serverTimestamp(),
      });

      // 3️⃣ Save minimal session info
      localStorage.setItem(
        "userData",
        JSON.stringify({
          uid: user.uid,
          name,
          email,
          role: "admin",
          storeNumber: storeNumber.trim(),
        })
      );

      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mt: 6, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 3, width: 380 }}>
        <Typography variant="h6" mb={2} align="center">
          Register
        </Typography>

        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          <TextField
            label="Store Number"
            value={storeNumber}
            onChange={(e) => setStoreNumber(e.target.value)}
            fullWidth
            helperText="You will only see reports for this store"
          />

          <Button
            variant="contained"
            onClick={handleRegister}
            disabled={loading}
            fullWidth
          >
            {loading ? "Creating Account..." : "Register"}
          </Button>

          <Button
            size="small"
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
