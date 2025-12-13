import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  Tooltip,
  IconButton
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const user = JSON.parse(localStorage.getItem("userData"));

  useEffect(() => {
    const load = async () => {
      const q = query(collection(db, "reports"), where("reporterId", "==", user.uid));
      const snapshot = await getDocs(q);

      const data = [];

      for (const d of snapshot.docs) {
        const report = { id: d.id, ...d.data() };

        // Load Category Name
        if (report.categoryId) {
          const ref = doc(db, "categories", report.categoryId);
          const snap = await getDoc(ref);
          if (snap.exists()) report.categoryName = snap.data().name;
        }

        data.push(report);
      }

      setReports(data);
    };

    load();
  }, [user.uid]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        My Reports
      </Typography>

      {reports.map((r) => (
        <Card key={r.id} sx={{ mb: 2, p: 1, borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ p: 1 }}>

            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {r.title || "Untitled Report"}
              </Typography>

              {r.status === "Complete" && (
                <CheckCircleIcon
                  sx={{
                    color: "white",
                    bgcolor: "green",
                    borderRadius: "50%",
                    padding: "3px",
                    width: 26,
                    height: 26
                  }}
                />
              )}
            </Box>

            {/* DETAILS */}
            <Typography
              variant="body2"
              sx={{ opacity: 0.8, mb: 1, fontSize: "0.85rem" }}
            >
              {r.fields?.Details || "No details provided"}
            </Typography>

            {/* Category */}
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              <strong>Category:</strong> {r.categoryName || "Unknown"}
            </Typography>

            {/* Subcategory */}
            {r.subcategory && (
              <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                <strong>Subcategory:</strong> {r.subcategory}
              </Typography>
            )}

            <Divider sx={{ my: 1 }} />

            {/* EXTRA FIELDS */}
            {r.fields && (
              <Box sx={{ mb: 1 }}>
                {Object.entries(r.fields).map(([key, val]) => {
                  if (key === "Details" || key === "policeReport") return null;
                  return (
                    <Typography
                      key={key}
                      variant="body2"
                      sx={{ fontSize: "0.78rem" }}
                    >
                      • <strong>{key}:</strong> {String(val)}
                    </Typography>
                  );
                })}
              </Box>
            )}

            {/* POLICE REPORT */}
            {r.fields?.policeReport && (
              <Box sx={{ mb: 1 }}>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.78rem", fontWeight: 600 }}
                >
                  Police Report
                </Typography>

                <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                  • Report #: {r.fields.policeReport}
                </Typography>

                {r.policeReportedAt && (
                  <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                    • Reported At:{" "}
                    {r.policeReportedAt.toDate().toLocaleString()}
                  </Typography>
                )}
              </Box>
            )}

            <Divider sx={{ my: 1 }} />

            {/* Status */}
            <Chip
              label={r.status}
              color={
                r.status === "Complete"
                  ? "success"
                  : r.status === "Pending"
                  ? "warning"
                  : "default"
              }
              size="small"
              sx={{ mr: 1 }}
            />

            {/* Admin Comment Tooltip */}
            {r.adminComment && (
              <Tooltip title={r.adminComment}>
                <IconButton size="small">
                  <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
