import React from "react";
import { Box, Button, Typography } from "@mui/material";

export default function PaginationControls({ page, totalPages, onPage }) {
  return (
    <Box
      sx={{
        mt: 3,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Button
        variant="contained"
        size="small"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        sx={{ borderRadius: 2 }}
      >
        Previous
      </Button>

      <Typography variant="body1">
        Page <strong>{page}</strong> / {totalPages}
      </Typography>

      <Button
        variant="contained"
        size="small"
        disabled={page === totalPages}
        onClick={() => onPage(page + 1)}
        sx={{ borderRadius: 2 }}
      >
        Next
      </Button>
    </Box>
  );
}
