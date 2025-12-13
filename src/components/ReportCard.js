// src/components/ReportCard.js
import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";

export default function ReportCard({ report, onEdit, onDelete, onToggleStatus }) {
  const f = report.fields || {};

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary">
          {report.createdAt?.toDate?.().toLocaleString()}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {report.categoryName} — {report.subcategory}
        </Typography>

        <Typography variant="body2">
          <strong>Offender:</strong> {report.offender || "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Store #:</strong> {f["Store Number"] || "—"}
        </Typography>

        <Typography variant="body2">
          <strong>Police Report:</strong> {f.policeReport || "—"}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Details:</strong> {f.Details || "—"}
        </Typography>

        {report.adminComment && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            <strong>Admin:</strong> {report.adminComment}
          </Typography>
        )}

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button size="small" onClick={onEdit}>
            Edit
          </Button>

          <Button
            size="small"
            onClick={onToggleStatus}
            color={report.status === "Complete" ? "warning" : "success"}
          >
            {report.status === "Complete" ? "Mark Pending" : "Mark Complete"}
          </Button>

          <Button size="small" color="error" onClick={onDelete}>
            Delete
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
