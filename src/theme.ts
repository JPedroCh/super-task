import { createTheme } from "@mui/material/styles";

/**
 * A light, professional job-platform look — not stock Material. Breakpoints
 * are left at MUI's defaults (sm=600, md=900) so they line up exactly with
 * `utils/device.ts`'s mobile/tablet/desktop thresholds.
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0B5FFF", dark: "#0A4FD6", light: "#4C8BFF" },
    secondary: { main: "#0EA372" },
    error: { main: "#D33636" },
    warning: { main: "#B4740E" },
    background: { default: "#F6F7F9", paper: "#FFFFFF" },
    text: { primary: "#12161C", secondary: "#4B5563" },
    divider: "#E2E5EA",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: [
      "Inter",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: { fontWeight: 700, fontSize: "2rem" },
    h2: { fontWeight: 700, fontSize: "1.5rem" },
    h3: { fontWeight: 700, fontSize: "1.25rem" },
    h4: { fontWeight: 600, fontSize: "1.1rem" },
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E2E5EA",
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "*:focus-visible": {
          outline: "2px solid #0B5FFF",
          outlineOffset: "2px",
        },
      },
    },
  },
});
