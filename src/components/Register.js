import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const uid = res.user.uid;

      // save default user role
      await setDoc(doc(db, "users", uid), { role: "user" });

      navigate("/dashboard", { replace: true });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: "auto" }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" align="center" sx={{ mb: 3 }}>
          Register
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

        <Button variant="contained" fullWidth onClick={register}>
          Register
        </Button>

        <Button
          component={Link}
          to="/login"
          fullWidth
          sx={{ mt: 2 }}
        >
          Already have an account? Login
        </Button>
      </Paper>
    </Box>
  );
}
