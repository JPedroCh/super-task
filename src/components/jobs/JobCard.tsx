import { Link as RouterLink } from "react-router-dom";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import PublicIcon from "@mui/icons-material/Public";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import type { Job } from "../../types/job";
import { formatSalary } from "../../utils/salary";
import { formatSeniority } from "../../utils/seniority";
import { formatRelativeTime } from "../../utils/date";
import { analytics } from "../../analytics/analytics";

interface JobCardProps {
  job: Job;
  position: number;
}

export default function JobCard({ job, position }: JobCardProps) {
  const salary = formatSalary(job.salary);
  const seniorityLabel = formatSeniority(job.seniority);
  const posted = formatRelativeTime(job.publishedAt);
  const to = `/jobs/${job.id}`;

  return (
    <Card component="li" sx={{ listStyle: "none" }}>
      <CardActionArea
        component={RouterLink}
        to={to}
        onClick={() => analytics.track("job_card_clicked", { jobId: job.id, position })}
        sx={{ p: 2, alignItems: "stretch", display: "block" }}
      >
        <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Avatar
              src={job.company.logoUrl ?? undefined}
              alt=""
              variant="rounded"
              sx={{ width: 44, height: 44, bgcolor: "grey.100", color: "text.secondary", fontSize: 16 }}
            >
              {job.company.name.slice(0, 1)}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="h4" component="h3" sx={{ lineHeight: 1.3 }} noWrap>
                {job.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {job.company.name}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
            {job.location.locality && (
              <Chip
                size="small"
                variant="outlined"
                icon={<PlaceOutlinedIcon />}
                label={job.location.locality}
                sx={{ maxWidth: "100%" }}
              />
            )}
            {job.location.isRemote && (
              <Chip size="small" color="secondary" variant="outlined" icon={<PublicIcon />} label="Remote" />
            )}
            {seniorityLabel && <Chip size="small" variant="outlined" label={seniorityLabel} />}
            {job.employmentType && <Chip size="small" variant="outlined" label={job.employmentType} />}
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 1.5 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 700, color: salary ? "text.primary" : "text.disabled" }}>
              {salary ?? "Salary not listed"}
            </Typography>
            {posted && (
              <Typography variant="caption" color="text.secondary">
                {posted}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
