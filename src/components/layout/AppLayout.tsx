import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import athynaLogo from "../../assets/athyna-logo.svg";

export default function AppLayout() {
  const location = useLocation();
  const isAnalytics = location.pathname === "/mock-analytics";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <Toolbar sx={{ gap: 1 }}>
          <Box
            component={RouterLink}
            to="/jobs"
            aria-label="Athyna — go to job board"
            sx={{
              display: "flex",
              alignItems: "center",
              mr: "auto",
            }}
          >
            <Box component="img" src={athynaLogo} alt="Athyna" sx={{ height: 20, width: "auto" }} />
          </Box>
          <Button
            component={RouterLink}
            to="/mock-analytics"
            size="small"
            startIcon={<QueryStatsIcon />}
            color={isAnalytics ? "primary" : "inherit"}
            variant={isAnalytics ? "outlined" : "text"}
          >
            Mock PostHog
          </Button>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        maxWidth="lg"
        sx={{ flex: 1, py: { xs: 2, sm: 3 }, px: { xs: 0, sm: 3 } }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}
