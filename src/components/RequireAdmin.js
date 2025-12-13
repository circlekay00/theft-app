import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const user = JSON.parse(localStorage.getItem("userData"));

  // User not logged in → redirect
  if (!user) return <Navigate to="/login" replace />;

  // User logged in but not admin → block access
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
