import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import type { JobFilters } from "../../types/filters";
import { SENIORITY_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, DRAWER_FILTER_KEYS } from "../../utils/filterOptions";

interface ActiveFilterChipsProps {
  filters: JobFilters;
  onRemove: (key: keyof JobFilters) => void;
  onClearAll: () => void;
}

function labelFor(key: keyof JobFilters, filters: JobFilters): string | null {
  switch (key) {
    case "q":
      return filters.q ? `"${filters.q}"` : null;
    case "remote":
      return filters.remote ? "Remote" : null;
    case "seniority": {
      const found = SENIORITY_OPTIONS.find((o) => o.value === filters.seniority);
      return found ? found.label : (filters.seniority ?? null);
    }
    case "employmentType": {
      const found = EMPLOYMENT_TYPE_OPTIONS.find((o) => o.value === filters.employmentType);
      return found ? found.label : (filters.employmentType ?? null);
    }
    case "city":
      return filters.city ?? null;
    case "country":
      return filters.country ?? null;
    case "skills":
      return filters.skills && filters.skills.length > 0 ? filters.skills.join(", ") : null;
    case "minSalary":
      return filters.minSalary !== undefined ? `Min ${filters.minSalary.toLocaleString()}` : null;
    case "maxSalary":
      return filters.maxSalary !== undefined ? `Max ${filters.maxSalary.toLocaleString()}` : null;
    case "publishedSince":
      return filters.publishedSince ? `Since ${filters.publishedSince.slice(0, 10)}` : null;
    default:
      return null;
  }
}

const DISPLAYED_KEYS: (keyof JobFilters)[] = ["q", ...DRAWER_FILTER_KEYS];

/** Removable chips for every currently active filter, plus a single
 * "Clear filters" action (brief §3). */
export default function ActiveFilterChips({ filters, onRemove, onClearAll }: ActiveFilterChipsProps) {
  const active = DISPLAYED_KEYS.map((key) => ({ key, label: labelFor(key, filters) })).filter(
    (x): x is { key: keyof JobFilters; label: string } => x.label !== null
  );

  if (active.length === 0) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      alignItems="center"
      sx={{ mb: 2 }}
      aria-label="Active filters"
    >
      {active.map(({ key, label }) => (
        <Chip key={key} label={label} onDelete={() => onRemove(key)} size="small" />
      ))}
      <Button size="small" onClick={onClearAll}>
        Clear filters
      </Button>
    </Stack>
  );
}
