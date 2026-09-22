import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";
import { useJobFilters } from "../hooks/useJobFilters";
import { useJobs } from "../hooks/useJobs";
import { usePageTiming } from "../hooks/usePageTiming";
import SearchBar from "../components/filters/SearchBar";
import FilterPanel from "../components/filters/FilterPanel";
import FilterDrawerMobile from "../components/filters/FilterDrawerMobile";
import ActiveFilterChips from "../components/filters/ActiveFilterChips";
import ResultsSummaryBar from "../components/jobs/ResultsSummaryBar";
import { JobList, JobListSkeleton } from "../components/jobs/JobList";
import ErrorState from "../components/ui/ErrorState";
import EmptyState from "../components/ui/EmptyState";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { countActiveDrawerFilters } from "../utils/filterOptions";
import { API_ERROR_MESSAGES } from "../utils/apiErrorMessages";
import type { JobFilters } from "../types/filters";

export default function JobBoardPage() {
  usePageTiming("job_board");
  const { filters, setFilters, setPage, clearFilters } = useJobFilters();
  const { data, status, error, isFetching, retry } = useJobs(filters);

  const activeDrawerCount = countActiveDrawerFilters(filters);
  const isPageOutOfRange =
    filters.pageNumber > 1 && data !== null && data.data.length === 0 && data.pagination.totalItems > 0;
  const isEmpty = data !== null && data.data.length === 0 && !isPageOutOfRange;

  const handleRemoveFilter = (key: keyof JobFilters) => {
    setFilters({ [key]: undefined } as Partial<JobFilters>);
  };

  return (
    <Box sx={{ px: { xs: 2, sm: 0 } }}>
      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h1">Find your next role</Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Box sx={{ flex: 1, width: { xs: "100%", sm: "auto" } }}>
            <SearchBar value={filters.q ?? ""} onCommit={(q) => setFilters({ q: q || undefined })} />
          </Box>
          <FilterDrawerMobile
            filters={filters}
            activeCount={activeDrawerCount}
            onApply={(partial) => setFilters(partial)}
            onClear={clearFilters}
          />
        </Stack>
      </Stack>

      <ActiveFilterChips filters={filters} onRemove={handleRemoveFilter} onClearAll={clearFilters} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "260px 1fr" }, gap: 3 }}>
        <Box
          component="aside"
          aria-label="Filter jobs"
          sx={{
            display: { xs: "none", md: "block" },
            position: "sticky",
            top: 88,
            alignSelf: "start",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
          }}
        >
          <FilterPanel filters={filters} onApply={(partial) => setFilters(partial)} onClear={clearFilters} />
        </Box>

        <Box>
          <ResultsSummaryBar
            totalItems={data?.pagination.totalItems ?? null}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
            onSortByChange={(sortBy) => setFilters({ sortBy })}
            onToggleOrder={() => setFilters({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc" })}
          />

          <Box sx={{ minHeight: 4, mb: 1 }}>{isFetching && data && <LinearProgress aria-hidden="true" />}</Box>

          <Box sx={{ opacity: isFetching && data ? 0.6 : 1, transition: "opacity 0.15s ease" }}>
            {status === "loading" && !data && <JobListSkeleton />}

            {status === "error" && !data && (
              <ErrorState message={API_ERROR_MESSAGES[error?.kind ?? "server"]} onRetry={retry} />
            )}

            {status === "error" && data && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={retry}>
                    Retry
                  </Button>
                }
              >
                {API_ERROR_MESSAGES[error?.kind ?? "server"]} Showing the last results loaded.
              </Alert>
            )}

            {isPageOutOfRange && (
              <EmptyState
                title="You've gone past the last page"
                message="There are no more jobs to show here."
                actionLabel="Back to page 1"
                onAction={() => setPage(1)}
              />
            )}

            {isEmpty && (
              <EmptyState
                title="No jobs match your filters"
                message="Try broadening your search or clearing a filter."
                actionLabel="Clear filters"
                onAction={clearFilters}
              />
            )}

            {data && data.data.length > 0 && (
              <>
                <JobList jobs={data.data} pageOffset={(filters.pageNumber - 1) * filters.pageSize} />
                {data.pagination.totalPages > 1 && (
                  <Stack alignItems="center" sx={{ mt: 4 }}>
                    <Pagination
                      count={data.pagination.totalPages}
                      page={data.pagination.pageNumber}
                      onChange={(_, page) => setPage(page)}
                      color="primary"
                      siblingCount={0}
                    />
                  </Stack>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
