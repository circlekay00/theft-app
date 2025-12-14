import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------- LOAD USERS ----------------
  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);

      const snap = await getDocs(collection(db, "users"));
      const list = snap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      }));

      setUsers(list);
      setLoading(false);
    };

    loadUsers();
  }, []);

  // ---------------- UPDATE NAME ----------------
  const updateName = async (userId, name) => {
    await updateDoc(doc(db, "users", userId), {
      name: name.trim(),
    });

    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, name } : u
      )
    );
  };

  // ---------------- UPDATE EMAIL (Firestore ONLY) ----------------
  const updateEmail = async (userId, email) => {
    await updateDoc(doc(db, "users", userId), {
      email: email.trim(),
    });

    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, email } : u
      )
    );
  };

  // ---------------- UPDATE STORE NUMBER ----------------
  const updateStoreNumber = async (userId, storeNumber) => {
    await updateDoc(doc(db, "users", userId), {
      storeNumber: String(storeNumber).trim(),
    });

    setUsers(prev =>
      prev.map(u =>
        u.id === userId ? { ...u, storeNumber } : u
      )
    );
  };

  // ---------------- DELETE USER ----------------
  const deleteUser = async (user) => {
    if (!window.confirm(`Delete user ${user.email}? This cannot be undone.`)) {
      return;
    }

    // Safety checks
    if (user.role === "superadmin") {
      alert("You cannot delete a Super Admin.");
      return;
    }

    if (auth.currentUser?.uid === user.id) {
      alert("You cannot delete yourself.");
      return;
    }

    // Delete Firestore user document
    await deleteDoc(doc(db, "users", user.id));

    setUsers(prev => prev.filter(u => u.id !== user.id));

    alert(
      "User document deleted.\n\nIMPORTANT:\nFirebase Auth account still exists.\nTo fully remove access, delete the user from Firebase Authentication."
    );
  };

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        Manage Users (Super Admin)
      </Typography>

      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Store Number</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                {/* NAME */}
                <TableCell>
                  {u.role === "superadmin" ? (
                    u.name
                  ) : (
                    <TextField
                      size="small"
                      defaultValue={u.name || ""}
                      onBlur={(e) =>
                        updateName(u.id, e.target.value)
                      }
                    />
                  )}
                </TableCell>

                {/* EMAIL */}
                <TableCell>
                  {u.role === "superadmin" ? (
                    u.email
                  ) : (
                    <TextField
                      size="small"
                      defaultValue={u.email || ""}
                      onBlur={(e) =>
                        updateEmail(u.id, e.target.value)
                      }
                    />
                  )}
                </TableCell>

                {/* ROLE */}
                <TableCell>{u.role}</TableCell>

                {/* STORE NUMBER */}
                <TableCell>
                  {u.role === "admin" ? (
                    <TextField
                      size="small"
                      defaultValue={u.storeNumber || ""}
                      onBlur={(e) =>
                        updateStoreNumber(u.id, e.target.value)
                      }
                    />
                  ) : (
                    "—"
                  )}
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  {u.role === "admin" && (
                    <Button
                      size="small"
                      color="error"
                      onClick={() => deleteUser(u)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
