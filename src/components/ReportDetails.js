import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, Typography, Divider, Box } from "@mui/material";

export default function ReportDetails({ report }) {
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const loadCategory = async () => {
      if (!report?.categoryId) return;
      try {
        const snap = await getDoc(doc(db, "categories", report.categoryId));
        if (snap.exists()) setCategoryName(snap.data().name || "");
      } catch (e) {
        console.error("cat load:", e);
      }
    };
    loadCategory();
  }, [report?.categoryId]);

  const fields = report.fields || {};

  return (
    <Card sx={{ mt: 2, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>Report Details</Typography>
        <Divider sx={{ my: 1 }} />

        <Typography sx={{ fontSize: "0.95rem" }}><strong>Category:</strong> {categoryName || report.categoryId || "N/A"}</Typography>
        <Typography sx={{ fontSize: "0.9rem" }}><strong>Subcategory:</strong> {report.subcategory || "N/A"}</Typography>
        <Typography sx={{ fontSize: "0.9rem" }}><strong>Store Number:</strong> {fields["Store Number"] ?? "N/A"}</Typography>
        <Typography sx={{ fontSize: "0.9rem" }}><strong>Offender:</strong> {fields.offender ?? "N/A"}</Typography>

        <Divider sx={{ my: 1 }} />

        <Typography sx={{ fontWeight: 700 }}>Police Report</Typography>
        <Typography sx={{ fontSize: "0.9rem" }}>• Report #: {fields.policeReport ?? "N/A"}</Typography>
        <Typography sx={{ fontSize: "0.9rem" }}>• Case #: {fields.policeReportNumber ?? "N/A"}</Typography>
        <Typography sx={{ fontSize: "0.9rem" }}>
          • Reported At: {fields.policeReportedAt ? (fields.policeReportedAt.toDate ? fields.policeReportedAt.toDate().toLocaleString() : String(fields.policeReportedAt)) : "N/A"}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Typography sx={{ fontWeight: 700 }}>Additional Details</Typography>
        {Object.entries(fields).map(([k, v]) => {
          if (["policeReport", "policeReportNumber", "policeReportedAt", "Store Number", "offender"].includes(k)) return null;
          return <Typography key={k} sx={{ fontSize: "0.9rem" }}>• {k}: {String(v)}</Typography>;
        })}

        {report.adminComment && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography sx={{ color: "green", fontWeight: 700 }}>Admin Comment</Typography>
            <Typography>{report.adminComment}</Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
}
