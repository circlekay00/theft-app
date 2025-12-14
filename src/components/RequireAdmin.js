import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const stored = localStorage.getItem("userData");

  if (!stored) {
    return <Navigate to="/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(stored);
  } catch {
    localStorage.removeItem("userData");
    return <Navigate to="/login" replace />;
  }

  // HARD GUARDS — PREVENT CRASHES
  if (!user.role || !user.storeNumber) {
    localStorage.removeItem("userData");
    return <Navigate to="/login" replace />;
  }

  // ALLOW admin + superadmin ONLY
  if (user.role !== "admin" && user.role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
