// src/components/LoginPage.js
import React, { useState } from "react";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";

/**
 * Hardcoded admin login (client-side).
 * Props:
 *  - onLogin(userObject) called when login succeeds; userObject can be { role: "admin", name: "Admin" }
 */
export default function LoginPage({ onLogin }) {
  const ADMIN_PASSWORD = "LetMeIn123";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const doLogin = () => {
    // simple check: password only (hardcoded) — email is cosmetic
    if (password === ADMIN_PASSWORD) {
      const user = { email: email || "admin@local", role: "admin", name: "Admin" };
      onLogin(user);
    } else {
      alert("Incorrect password");
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 480, mx: "auto", mt: 8 }}>
      <Paper sx={{ p: 3, background: "#1e1e1e" }}>
        <Typography variant="h6" sx={{ color: "#ff9100", mb: 2 }} align="center">
          Admin Login
        </Typography>

        <TextField
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          label="Email (optional)"
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Password"
          type="password"
          sx={{ mb: 2 }}
        />

        <Button variant="contained" fullWidth onClick={doLogin} sx={{ background: "#ff6f00", "&:hover": { background: "#ff9100" } }}>
          Login
        </Button>
      </Paper>
    </Box>
  );
}