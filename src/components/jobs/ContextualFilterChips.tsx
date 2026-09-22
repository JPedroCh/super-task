import { Link as RouterLink } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import type { ContextualFilterChip } from "../../utils/similarJobs";
import { partialFiltersToSearchParams } from "../../schemas/filters";
import { withPreservedParams } from "../../utils/preservedParams";
import { analytics } from "../../analytics/analytics";

interface ContextualFilterChipsProps {
  chips: ContextualFilterChip[];
  /** The details page's own search params (e.g. `?utm_source=google`) — any
   * `utm_*` values are carried forward onto the board link so acquisition
   * attribution survives the click (brief §32). */
  preserveParams: URLSearchParams;
}

/**
 * One clickable chip per field the current job actually carries — this is
 * the "reach similar jobs with one click" surface for a user who lands
 * directly on a details page from Google (brief §8/§32). Rendered only
 * from real data, never a fixed field list.
 */
export default function ContextualFilterChips({ chips, preserveParams }: ContextualFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" role="group" aria-label="Filter jobs by">
      {chips.map((chip, i) => {
        const search = withPreservedParams(partialFiltersToSearchParams(chip.filters), preserveParams).toString();
        const [filterKey] = Object.keys(chip.filters);
        return (
          <Chip
            key={`${filterKey}-${chip.label}-${i}`}
            component={RouterLink}
            to={`/jobs?${search}`}
            clickable
            label={chip.label}
            variant="outlined"
            color="primary"
            onClick={() =>
              analytics.track("filter_used", { filter: filterKey ?? "unknown", value: chip.label })
            }
          />
        );
      })}
    </Stack>
  );
}
