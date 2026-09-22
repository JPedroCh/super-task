import { useEffect, useRef } from "react";
import { useParams, useSearchParams, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import PublicIcon from "@mui/icons-material/Public";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import { useJob } from "../hooks/useJob";
import { usePageTiming } from "../hooks/usePageTiming";
import { analytics } from "../analytics/analytics";
import ApplyCta from "../components/jobs/ApplyCta";
import JobDescription from "../components/jobs/JobDescription";
import ContextualFilterChips from "../components/jobs/ContextualFilterChips";
import ErrorState from "../components/ui/ErrorState";
import { formatSalary } from "../utils/salary";
import { formatSeniority } from "../utils/seniority";
import { formatAbsoluteDate } from "../utils/date";
import { buildContextualFilterChips, buildSimilarJobsFilters } from "../utils/similarJobs";
import { partialFiltersToSearchParams } from "../schemas/filters";
import { withPreservedParams } from "../utils/preservedParams";
import { API_ERROR_MESSAGES } from "../utils/apiErrorMessages";
import Button from "@mui/material/Button";
import TuneIcon from "@mui/icons-material/Tune";

function DetailsSkeleton() {
  return (
    <Stack spacing={2} aria-hidden="true">
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Skeleton variant="rounded" width={56} height={56} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={36} />
          <Skeleton variant="text" width="35%" height={24} />
        </Box>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={90} height={28} />
        <Skeleton variant="rounded" width={70} height={28} />
        <Skeleton variant="rounded" width={100} height={28} />
      </Stack>
      <Skeleton variant="rounded" height={48} />
      <Skeleton variant="text" height={200} />
    </Stack>
  );
}

export default function JobDetailsPage() {
  usePageTiming("job_details");
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const { data: job, status, error, retry } = useJob(jobId);
  const trackedJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (job && trackedJobIdRef.current !== job.id) {
      trackedJobIdRef.current = job.id;
      analytics.track("job_detail_viewed", { jobId: job.id });
    }
  }, [job]);

  if (status === "loading") {
    return (
      <Box sx={{ px: { xs: 2, sm: 0 }, maxWidth: 800, mx: "auto" }}>
        <DetailsSkeleton />
      </Box>
    );
  }

  if (status === "error" || !job) {
    return (
      <Box sx={{ px: { xs: 2, sm: 0 } }}>
        <ErrorState
          title={error?.kind === "notFound" || error?.kind === "invalidId" ? "Job not found" : undefined}
          message={API_ERROR_MESSAGES[error?.kind ?? "server"]}
          onRetry={error?.kind === "notFound" || error?.kind === "invalidId" ? undefined : retry}
        />
        <Stack alignItems="center">
          <Button component={RouterLink} to="/jobs" variant="outlined">
            Back to job board
          </Button>
        </Stack>
      </Box>
    );
  }

  const salaryLabel = formatSalary(job.salary);
  const seniorityLabel = formatSeniority(job.seniority);
  const posted = formatAbsoluteDate(job.publishedAt);
  const contextualChips = buildContextualFilterChips(job, seniorityLabel);
  const similarJobsSearch = withPreservedParams(
    partialFiltersToSearchParams(buildSimilarJobsFilters(job)),
    searchParams
  ).toString();

  const handleFindSimilar = () => {
    analytics.track("filter_used", { filter: "similar_jobs", value: job.title });
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 0 }, maxWidth: 800, mx: "auto", pb: { xs: 12, md: 4 } }}>
      {/* Above-the-fold summary: title, company, location, remote, seniority,
          employment type, salary and the Apply CTA all fit on a 375px
          viewport without scrolling — the median mobile user bounces after
          11 seconds (SCOPING.md). */}
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar
            src={job.company.logoUrl ?? undefined}
            alt=""
            variant="rounded"
            sx={{ width: 56, height: 56, bgcolor: "grey.100", color: "text.secondary" }}
          >
            {job.company.name.slice(0, 1)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h1" component="h1" sx={{ fontSize: { xs: "1.4rem", sm: "1.75rem" } }}>
              {job.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {job.company.name}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {job.location.locality && (
            <Chip icon={<PlaceOutlinedIcon />} label={job.location.locality} variant="outlined" />
          )}
          {job.location.isRemote && (
            <Chip icon={<PublicIcon />} label="Remote" color="secondary" variant="outlined" />
          )}
          {seniorityLabel && <Chip label={seniorityLabel} variant="outlined" />}
          {job.employmentType && <Chip label={job.employmentType} variant="outlined" />}
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" rowGap={1}>
          <Typography variant="h3" component="p" sx={{ color: salaryLabel ? "text.primary" : "text.disabled" }}>
            {salaryLabel ?? "Salary not listed"}
          </Typography>
          {posted && (
            <Typography variant="body2" color="text.secondary">
              Posted {posted}
            </Typography>
          )}
        </Stack>

        <ApplyCta jobId={job.id} variant="inline" />
      </Stack>

      <Divider sx={{ my: 3 }} />

      {contextualChips.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Filter by this job's attributes
          </Typography>
          <ContextualFilterChips chips={contextualChips} preserveParams={searchParams} />
        </Box>
      )}

      <Button
        component={RouterLink}
        to={`/jobs?${similarJobsSearch}`}
        onClick={handleFindSimilar}
        variant="contained"
        color="secondary"
        startIcon={<TuneIcon />}
        sx={{ mb: 3 }}
      >
        Find similar jobs
      </Button>

      {job.description ? (
        <JobDescription markdown={job.description} />
      ) : (
        <Typography color="text.secondary">No description provided.</Typography>
      )}

      <ApplyCta jobId={job.id} variant="sticky" salaryLabel={salaryLabel} />

    </Box>
  );
}
