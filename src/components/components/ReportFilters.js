import React from "react";
import { Box, TextField, MenuItem, Paper } from "@mui/material";

export default function ReportFilters({
  searchText,
  onSearchText,
  filterStatus,
  onFilterStatus,
  categories,
  filterCategoryId,
  onFilterCategoryId,
}) {
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        borderRadius: 2,
      }}
    >
      {/* Search */}
      <TextField
        label="Search reports…"
        variant="outlined"
        size="small"
        value={searchText}
        onChange={(e) => onSearchText(e.target.value)}
        sx={{ flex: 1, minWidth: "200px" }}
      />

      {/* Status Filter */}
      <TextField
        select
        label="Status"
        variant="outlined"
        size="small"
        value={filterStatus}
        onChange={(e) => onFilterStatus(e.target.value)}
        sx={{ width: "160px" }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Complete">Complete</MenuItem>
      </TextField>

      {/* Category Filter */}
      <TextField
        select
        label="Category"
        variant="outlined"
        size="small"
        value={filterCategoryId}
        onChange={(e) => onFilterCategoryId(e.target.value)}
        sx={{ width: "200px" }}
      >
        <MenuItem value="">All</MenuItem>
        {categories.map((c) => (
          <MenuItem key={c.id} value={c.id}>
            {c.name}
          </MenuItem>
        ))}
      </TextField>
    </Paper>
  );
}
