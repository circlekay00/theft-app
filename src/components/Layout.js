import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u || null);
      setRole(null);

      if (u) {
        const snap = await getDoc(doc(db, "users", u.uid));
        if (snap.exists()) {
          setRole(snap.data().role || "user");
        }
      }
    });

    return () => unsub();
  }, []);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            {/* PUBLIC (LOGGED OUT ONLY) */}
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

            {/* AUTHENTICATED USERS */}
            {user && (
              <Button color="inherit" component={Link} to="/">
                Report Form
              </Button>
            )}

            {/* ADMIN LINKS */}
            {user && (role === "admin" || role === "superadmin") && (
              <>
                <Button color="inherit" component={Link} to="/admin">
                  Dashboard
                </Button>

                <Button color="inherit" component={Link} to="/manage-categories">
                  Categories
                </Button>

                <Button color="inherit" component={Link} to="/manage-subcategories">
                  Subcategories
                </Button>

                <Button color="inherit" component={Link} to="/manage-fields">
                  Custom Fields
                </Button>

                <Button color="inherit" component={Link} to="/manage-offenders">
                  Offenders
                </Button>
              </>
            )}

            {/* SUPER ADMIN ONLY */}
            {user && role === "superadmin" && (
              <Button color="inherit" component={Link} to="/manage-users">
                Users
              </Button>
            )}
          </Box>

          {/* RIGHT SIDE */}
          {user && (
            <Button color="inherit" component={Link} to="/logout">
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {children}
    </>
  );
}
