import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert
} from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      // 🔐 AUTH LOGIN
      const cred = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const uid = cred.user.uid;

      // 🔎 FETCH FIRESTORE USER
      const userSnap = await getDoc(doc(db, "users", uid));

      if (!userSnap.exists()) {
        throw new Error("User profile not found. Contact admin.");
      }

      const userData = userSnap.data();

      // 🛑 HARD GUARD (PREVENTS storeNumber crash)
      if (!userData.role || !userData.storeNumber) {
        throw new Error("User account misconfigured.");
      }

      // ✅ SAVE LOCALLY
      localStorage.setItem(
        "userData",
        JSON.stringify({
          uid,
          name: userData.name,
          role: userData.role,
          storeNumber: userData.storeNumber
        })
      );

      navigate("/admin");
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Paper sx={{ p: 3, width: 360 }}>
        <Typography variant="h6" mb={2}>
          Admin Login
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          margin="normal"
        />

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? "Signing in..." : "Login"}
        </Button>
      </Paper>
    </Box>
  );
}
