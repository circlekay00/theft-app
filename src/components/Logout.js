import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      await signOut(auth);
      navigate("/login", { replace: true });
    };

    doLogout();
  }, [navigate]);

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <CircularProgress />
    </Box>
  );
}
