// src/components/ReportFilters.js
import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

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
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        alignItems: "center",
      }}
    >
      {/* 🔍 Search */}
      <TextField
        value={searchText}
        onChange={(e) => onSearchText(e.target.value)}
        placeholder="Search reports..."
        size="small"
        sx={{ minWidth: 240 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchText && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchText("")}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {/* 📌 Status */}
      <TextField
        select
        label="Status"
        size="small"
        value={filterStatus}
        onChange={(e) => onFilterStatus(e.target.value)}
        sx={{ width: 160 }}
      >
        <MenuItem value="">All</MenuItem>
        <MenuItem value="Pending">Pending</MenuItem>
        <MenuItem value="Complete">Complete</MenuItem>
      </TextField>

      {/* 🗂 Category */}
      <TextField
        select
        label="Category"
        size="small"
        value={filterCategoryId}
        onChange={(e) => onFilterCategoryId(e.target.value)}
        sx={{ width: 200 }}
      >
        <MenuItem value="">All</MenuItem>
        {categories.map((cat) => (
          <MenuItem key={cat.id} value={cat.id}>
            {cat.name}
          </MenuItem>
        ))}
      </TextField>

      {/* Reset button (only shows when filters active) */}
      {(searchText || filterStatus || filterCategoryId) && (
        <IconButton
          color="error"
          onClick={() => {
            onSearchText("");
            onFilterStatus("");
            onFilterCategoryId("");
          }}
          sx={{ ml: 1 }}
        >
          <ClearIcon />
        </IconButton>
      )}
    </Box>
  );
}
