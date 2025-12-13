// src/components/AdminRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import useUser from "../hooks/useUser";

export default function AdminRoute({ children }) {
  const { user, role, loading } = useUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;

  return children;
}
