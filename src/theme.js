// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Josefin Sans, sans-serif",
    h5: { fontSize: "1rem" },
    h6: { fontSize: "0.95rem" },
    body1: { fontSize: "0.8rem" },
    button: { fontSize: "0.8rem" }
  },
  palette: {
    mode: "dark",
    primary: { main: "#ff6f00" },
    secondary: { main: "#ff9100" },
    background: { default: "#2c2c2c", paper: "#333" }
  },
  components: {
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 10 } }
    },
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", borderRadius: 8 } }
    }
  }
});

export default theme;
