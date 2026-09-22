import { useEffect, useRef } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import DemoBanner from "../components/ui/DemoBanner";
import ApplyForm from "../components/forms/ApplyForm";
import ErrorState from "../components/ui/ErrorState";
import { useJob } from "../hooks/useJob";
import { usePageTiming } from "../hooks/usePageTiming";
import { analytics } from "../analytics/analytics";
import { API_ERROR_MESSAGES } from "../utils/apiErrorMessages";
import { safeHttpsHostname } from "../utils/url";

export default function MockApplyPage() {
  usePageTiming("external_apply");
  const { jobId } = useParams<{ jobId: string }>();
  const { data: job, status, error, retry } = useJob(jobId);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current && jobId) {
      trackedRef.current = true;
      analytics.track("external_apply_viewed", { jobId });
    }
  }, [jobId]);

  const hostname = job ? safeHttpsHostname(job.applicationUrl) : null;

  return (
    <Box sx={{ px: { xs: 2, sm: 0 }, maxWidth: 480, mx: "auto" }}>
      <DemoBanner title="Demonstration only">
        This represents being redirected to an external application page. No redirect happens,
        and nothing you submit is sent anywhere.
      </DemoBanner>

      <Typography variant="h1" sx={{ mb: 1 }}>
        Apply for this role
      </Typography>

      {status === "loading" && <Skeleton variant="text" width="70%" height={28} sx={{ mb: 3 }} />}

      {status === "success" && job && (
        <Typography color="text.secondary" sx={{ mb: hostname ? 0.5 : 3 }}>
          {job.title} at {job.company.name}
        </Typography>
      )}

      {status === "success" && hostname && (
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
          In a real flow, this would continue at <strong>{hostname}</strong>.
        </Typography>
      )}

      {status === "error" && (
        <ErrorState
          message={API_ERROR_MESSAGES[error?.kind ?? "server"]}
          onRetry={jobId ? retry : undefined}
        />
      )}

      {jobId && status !== "error" && <ApplyForm jobId={jobId} />}

      <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
        <Link component={RouterLink} to="/jobs">
          Back to job board
        </Link>
      </Stack>
    </Box>
  );
}
