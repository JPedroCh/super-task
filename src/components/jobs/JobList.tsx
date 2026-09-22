import Box from "@mui/material/Box";
import type { Job } from "../../types/job";
import JobCard from "./JobCard";
import JobCardSkeleton from "./JobCardSkeleton";

const gridSx = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
  gap: 2,
  p: 0,
  m: 0,
} as const;

interface JobListProps {
  jobs: Job[];
  pageOffset: number;
}

export function JobList({ jobs, pageOffset }: JobListProps) {
  return (
    <Box component="ul" sx={gridSx}>
      {jobs.map((job, index) => (
        <JobCard key={job.id} job={job} position={pageOffset + index} />
      ))}
    </Box>
  );
}

export function JobListSkeleton({ count = 9 }: { count?: number }) {
  return (
    <Box component="ul" sx={gridSx}>
      {Array.from({ length: count }, (_, i) => (
        <JobCardSkeleton key={i} />
      ))}
    </Box>
  );
}
