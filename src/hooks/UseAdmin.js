import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function useAdmin() {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const check = async () => {
      const ref = doc(db, "admins", auth.currentUser.uid);
      const snap = await getDoc(ref);
      setAdmin(snap.exists() && snap.data().isAdmin === true);
    };

    check();
  }, [auth.currentUser]);

  return admin;
}
