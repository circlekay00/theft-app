import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";


export default function Navbar() {
const user = useAuth();
const navigate = useNavigate();
const role = localStorage.getItem("role");


const logout = () => {
localStorage.clear();
navigate("/login");
};


return (
<AppBar position="static">
<Toolbar>
<Box sx={{ flexGrow: 1 }}>
<Button color="inherit" component={Link} to="/">
Report
</Button>


{user && (
<Button color="inherit" component={Link} to="/my-reports">
My Reports
</Button>
)}


{role === "admin" && (
<Button color="inherit" component={Link} to="/admin">
Admin
</Button>
)}
</Box>


{!user && (
<>
<Button color="inherit" component={Link} to="/login">
Login
</Button>
<Button color="inherit" component={Link} to="/register">
Register
</Button>
</>
)}


{user && (
<Button color="inherit" onClick={logout}>
Logout
</Button>
)}
</Toolbar>
</AppBar>
);
}