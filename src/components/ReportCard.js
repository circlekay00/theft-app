import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import NoteAltIcon from "@mui/icons-material/NoteAlt";

export default function ReportCard({
  report,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  const f = report.fields || {};

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Typography variant="subtitle2" color="text.secondary">
          {report.categoryName || "Uncategorized"}
          {report.subcategory ? ` / ${report.subcategory}` : ""}
        </Typography>

        <Typography variant="h6" sx={{ mt: 0.5 }}>
          Offender: {f.offender || report.offender || "N/A"}
        </Typography>

        <Typography variant="body2">
          Store: {f["Store Number"] || report["Store Number"] || "N/A"}
        </Typography>

        <Typography variant="body2" sx={{ mt: 1 }}>
          {f.Details || report.Details || "No details"}
        </Typography>

        {report.adminComment && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Admin Comment:
            </Typography>
            <Typography variant="body2">
              {report.adminComment}
            </Typography>
          </>
        )}
      </CardContent>

      {/* Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1,
          gap: 0.5,
        }}
      >
        <Box>
          <IconButton size="small" onClick={() => onEdit(report)}>
            <EditIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" onClick={onDelete}>
            <DeleteIcon fontSize="small" />
          </IconButton>

          {/* Admin Comment Icon */}
          <IconButton
            size="small"
            title="Admin Comment"
            onClick={() => onEdit(report)}
          >
            <NoteAltIcon fontSize="small" />
          </IconButton>
        </Box>

        <Button
          size="small"
          variant="outlined"
          onClick={onToggleStatus}
        >
          {report.status === "Complete" ? "Complete" : "Pending"}
        </Button>
      </Box>
    </Card>
  );
}
