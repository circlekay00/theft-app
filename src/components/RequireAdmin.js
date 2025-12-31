import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { CircularProgress, Box } from "@mui/material";

export default function RequireAdmin({ children }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      // ❌ If user is anonymous, we cannot check Firestore, block access
      if (!user.email) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "admins", user.email));

        if (snap.exists()) {
          const role = snap.data().role;
          setAllowed(role === "admin" || role === "superadmin");
        } else {
          setAllowed(false);
        }
      } catch (err) {
        console.error("RequireAdmin Firestore error:", err);
        setAllowed(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!allowed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
