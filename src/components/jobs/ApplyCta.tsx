import { Link as RouterLink } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { analytics } from "../../analytics/analytics";

interface ApplyCtaProps {
  jobId: string;
  variant: "inline" | "sticky";
  salaryLabel?: string | null;
}

/**
 * The primary CTA. `variant="sticky"` pins it to the bottom of the
 * viewport on mobile only, so it survives scrolling through a long
 * description (the 61%-of-traffic, 8%-conversion mobile problem the
 * brief centers on).
 */
export default function ApplyCta({ jobId, variant, salaryLabel }: ApplyCtaProps) {
  const handleClick = () => analytics.track("apply_clicked", { jobId });

  if (variant === "sticky") {
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: (t) => t.zIndex.appBar,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          p: 1.5,
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        {salaryLabel && (
          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
            {salaryLabel}
          </Typography>
        )}
        <Button
          component={RouterLink}
          to={`/apply/${jobId}`}
          onClick={handleClick}
          variant="contained"
          size="large"
          endIcon={<OpenInNewIcon />}
          sx={{ ml: "auto" }}
        >
          Apply now
        </Button>
      </Box>
    );
  }

  return (
    <Button
      component={RouterLink}
      to={`/apply/${jobId}`}
      onClick={handleClick}
      variant="contained"
      size="large"
      endIcon={<OpenInNewIcon />}
      fullWidth
      sx={{ mt: 2 }}
    >
      Apply now
    </Button>
  );
}
