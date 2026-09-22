import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { SORT_OPTIONS } from "../../utils/filterOptions";
import type { SortBy, SortOrder } from "../../types/filters";

interface ResultsSummaryBarProps {
  totalItems: number | null;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onSortByChange: (value: SortBy) => void;
  onToggleOrder: () => void;
}

export default function ResultsSummaryBar({
  totalItems,
  sortBy,
  sortOrder,
  onSortByChange,
  onToggleOrder,
}: ResultsSummaryBarProps) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ xs: "flex-start", sm: "center" }}
      justifyContent={{ xs: "flex-start", sm: "space-between" }}
      spacing={1.5}
      sx={{ mb: 2, flexWrap: "wrap", rowGap: 1 }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        aria-live="polite"
        sx={{ order: { xs: 2, sm: 0 } }}
      >
        {totalItems === null
          ? "Loading jobs…"
          : `${totalItems.toLocaleString()} job${totalItems === 1 ? "" : "s"} found`}
      </Typography>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ order: { xs: 1, sm: 0 } }}>
        <TextField
          select
          size="small"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value as SortBy)}
          label="Sort by"
          sx={{ minWidth: 150 }}
        >
          {SORT_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <Tooltip title={sortOrder === "asc" ? "Ascending" : "Descending"}>
          <IconButton
            onClick={onToggleOrder}
            aria-label={`Sort order: ${sortOrder === "asc" ? "ascending" : "descending"}. Click to toggle.`}
          >
            {sortOrder === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
