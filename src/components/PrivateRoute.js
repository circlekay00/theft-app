import React from "react";
import { Navigate } from "react-router-dom";


export default function PrivateRoute({ children, allowedRoles }) {
const stored = JSON.parse(localStorage.getItem("userData"));


if (!stored) return <Navigate to="/login" />;


if (!allowedRoles.includes(stored.role)) return <Navigate to="/login" />;


return children;
}