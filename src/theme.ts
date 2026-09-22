import { createTheme } from "@mui/material/styles";

/**
 * Athyna's visual identity, sampled directly from athyna.com and their own
 * job board at jobs.athyna.com:
 *  - Purple #6E35CB (primary CTAs, links) and mint #6CD7AE (secondary accent
 *    — always as a fill with dark text, matching how athyna itself uses it:
 *    mint text alone fails contrast, mint-as-background does not).
 *  - Cream page background (#F8F5F2) with white card/surface content, near-
 *    black headings and a muted slate for secondary text — the same pairing
 *    jobs.athyna.com uses for job titles vs. meta text.
 *  - Lexend, the typeface both athyna.com and jobs.athyna.com load.
 * Breakpoints are left at MUI's defaults (sm=600, md=900) so they line up
 * exactly with `utils/device.ts`'s mobile/tablet/desktop thresholds.
 */
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6E35CB" },
    secondary: { main: "#6CD7AE", contrastText: "#1C1E1B" },
    error: { main: "#D33636" },
    warning: { main: "#B4740E" },
    background: { default: "#F8F5F2", paper: "#FFFFFF" },
    text: { primary: "#1C1E1B", secondary: "#60646C" },
    divider: "#E8E9E4",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: [
      "Lexend",
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
        // Athyna's own CTAs (site nav, job-board apply/search buttons) are
        // fully pill-shaped — a signature shape, not just a color choice.
        root: { borderRadius: 999, paddingInline: "20px" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #E8E9E4",
          boxShadow: "none",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        // jobs.athyna.com's own job-meta chips ("Full Time", seniority,
        // etc.) use a modest ~6px radius, not MUI's default pill chip.
        root: { fontWeight: 600, borderRadius: 6 },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "*:focus-visible": {
          outline: "2px solid #6E35CB",
          outlineOffset: "2px",
        },
      },
    },
  },
});
