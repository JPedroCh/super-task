import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import DemoBanner from "../components/ui/DemoBanner";
import SignUpForm from "../components/forms/SignUpForm";
import { usePageTiming } from "../hooks/usePageTiming";
import { analytics } from "../analytics/analytics";

export default function MockSignUpPage() {
  usePageTiming("signup");
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      analytics.track("signup_viewed", {});
    }
  }, []);

  return (
    <Box sx={{ px: { xs: 2, sm: 0 }, maxWidth: 440, mx: "auto" }}>
      <DemoBanner title="Demonstration only">
        This sign-up flow doesn't create a real account. Nothing you enter is stored or sent
        anywhere.
      </DemoBanner>
      <Typography variant="h1" sx={{ mb: 3 }}>
        Create your account
      </Typography>
      <SignUpForm />
      <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
        <Link component={RouterLink} to="/jobs">
          Back to job board
        </Link>
      </Stack>
    </Box>
  );
}
