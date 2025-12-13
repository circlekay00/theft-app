import React, { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await signOut(auth);
        localStorage.removeItem("userData"); // IMPORTANT
      } catch (e) {
        console.error("Logout error:", e);
      } finally {
        navigate("/login");
      }
    })();
  }, [navigate]);

  return <div style={{ padding: 16 }}>Signing out...</div>;
}
