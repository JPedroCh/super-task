import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TuneIcon from "@mui/icons-material/Tune";
import Stack from "@mui/material/Stack";
import FilterPanel from "./FilterPanel";
import type { JobFilters } from "../../types/filters";

interface FilterDrawerMobileProps {
  filters: JobFilters;
  activeCount: number;
  onApply: (partial: Partial<JobFilters>) => void;
  onClear: () => void;
}

/** The mobile entry point into filtering — a prominent button with an
 * active-count badge that opens a bottom sheet (brief §3). Wraps the same
 * FilterPanel the desktop sidebar renders inline. */
export default function FilterDrawerMobile({ filters, activeCount, onApply, onClear }: FilterDrawerMobileProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Badge
        badgeContent={activeCount}
        color="primary"
        invisible={activeCount === 0}
        sx={{ display: { xs: "inline-flex", md: "none" } }}
      >
        <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => setOpen(true)}>
          Filters
        </Button>
      </Badge>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: { sx: { maxHeight: "88vh", borderTopLeftRadius: 16, borderTopRightRadius: 16 } },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, pb: 0 }}>
          <Typography variant="h3" component="h2">
            Filters
          </Typography>
          <IconButton onClick={() => setOpen(false)} aria-label="Close filters">
            <CloseIcon />
          </IconButton>
        </Stack>
        <Box sx={{ overflowY: "auto" }}>
          <FilterPanel filters={filters} onApply={onApply} onClear={onClear} onApplied={() => setOpen(false)} />
        </Box>
      </Drawer>
    </>
  );
}
