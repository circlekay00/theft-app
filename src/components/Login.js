// src/components/Login.js
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      const snap = await getDoc(doc(db, "users", uid));
      const data = snap.exists() ? snap.data() : {};

      let role = data?.role || "user";
      let name = data?.name || email;

      // ADMIN OVERRIDE
      if (adminCode === "SUPERADMIN123") {
        role = "admin";
        name = name || "Admin";
      }

      // 🔑 CRITICAL: persist user session
      localStorage.setItem(
        "userData",
        JSON.stringify({ uid, role, name })
      );

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: "auto" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }} align="center">
          Login
        </Typography>

        <TextField
          label="Email"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setEmail(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          sx={{ mb: 3 }}
          onChange={(e) => setPassword(e.target.value)}
        />

        <TextField
          label="Admin Code (optional)"
          fullWidth
          sx={{ mb: 3 }}
          onChange={(e) => setAdminCode(e.target.value)}
        />

        <Button variant="contained" fullWidth onClick={login}>
          Login
        </Button>

      
      </Paper>
    </Box>
  );
}
