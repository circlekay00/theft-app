// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Josefin Sans, sans-serif",

    // 🔽 Slightly smaller than before
    h5: { fontSize: "0.95rem" },
    h6: { fontSize: "0.9rem" },
    body1: { fontSize: "0.75rem" },
    body2: { fontSize: "0.7rem" },
    button: { fontSize: "0.7rem" },

    // global base
    fontSize: 11,
  },

  palette: {
    mode: "dark",
    primary: { main: "#ff6f00" },
    secondary: { main: "#ff9100" },
    background: {
      default: "#2c2c2c",
      paper: "#333",
    },
  },

  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,

          // 🔽 dense
          minHeight: 28,
          padding: "2px 8px",
        },
      },
    },

    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: "0.7rem",
          minHeight: 32,
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          fontSize: "0.7rem",
        },
      },
    },

    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "8px",
        },
      },
    },

    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "12px",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.7rem",
          minHeight: 28,
        },
      },
    },
  },
});

export default theme;
