import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

export default function ReportCard({
  report,
  onToggle,
  onEditPolice,
  onDelete,
  onExport,
}) {
  const f = report.fields || {};

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        p: 1,
        boxShadow: 2,
        background: "#fafafa",
      }}
    >
      <CardContent sx={{ p: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography sx={{ fontSize: "15px", fontWeight: "bold" }}>
            Report #{report.id}
          </Typography>

          <Chip
            label={report.status}
            color={report.status === "Complete" ? "success" : "warning"}
            size="small"
          />
        </Box>

        <Divider sx={{ mb: 1 }} />

        {/* Category */}
        <Typography sx={{ fontSize: "13px" }}>
          <strong>Category:</strong> {report.categoryName || "N/A"}
        </Typography>

        {/* Subcategory */}
        <Typography sx={{ fontSize: "13px" }}>
          <strong>Subcategory:</strong> {report.subcategory || "N/A"}
        </Typography>

        {/* Store Number */}
        <Typography sx={{ fontSize: "13px" }}>
          <strong>Store Number:</strong> {f["Store Number"] || "N/A"}
        </Typography>

        {/* Offender */}
        <Typography sx={{ fontSize: "13px" }}>
          <strong>Offender:</strong> {f.offender || "N/A"}
        </Typography>

        {/* Details */}
        <Typography sx={{ fontSize: "13px" }}>
          <strong>Details:</strong> {f.Details || "N/A"}
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* Police Report Fields */}
        <Typography sx={{ fontSize: "13px" }}>
          <strong>Police Report #:</strong> {f.policeReport || "N/A"}
        </Typography>

        <Typography sx={{ fontSize: "13px" }}>
          <strong>Case Number:</strong> {f.policeReportNumber || "N/A"}
        </Typography>

        <Typography sx={{ fontSize: "13px" }}>
          <strong>Reported At:</strong>{" "}
          {f.policeReportedAt?.seconds
            ? new Date(f.policeReportedAt.seconds * 1000).toLocaleString()
            : "N/A"}
        </Typography>

        {/* Admin Comment */}
        {report.adminComment && (
          <Typography
            sx={{
              mt: 1,
              fontSize: "13px",
              fontWeight: "bold",
              color: "green",
            }}
          >
            Comment: {report.adminComment}
          </Typography>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Buttons */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button variant="contained" size="small" onClick={onToggle}>
            {report.status === "Complete" ? "Mark Pending" : "Mark Complete"}
          </Button>

          <Button variant="outlined" size="small" onClick={onEditPolice}>
            Edit Police Report
          </Button>

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={onDelete}
          >
            Delete
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => onExport(report)}
          >
            PDF
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
