import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

export default function RequireSuperAdmin({ children }) {
  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const check = async () => {
      const user = auth.currentUser;
      if (!user) {
        setAllowed(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      setAllowed(snap.exists() && snap.data().role === "superadmin");
    };

    check();
  }, []);

  if (allowed === null) return null;
  if (!allowed) return <Navigate to="/" replace />;

  return children;
}
