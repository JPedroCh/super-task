import { useMemo, useState } from "react";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { JobFilters } from "../../types/filters";
import {
  SENIORITY_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  POSTED_WITHIN_OPTIONS,
  postedWithinToDate,
  dateToPostedWithinValue,
} from "../../utils/filterOptions";
import { diffFilterChanges } from "../../utils/filterDiff";
import { analytics } from "../../analytics/analytics";

const EMPTY_DRAFT: FilterDraft = {
  remote: false,
  seniority: "",
  employmentType: "",
  minSalary: "",
  maxSalary: "",
  postedWithin: "",
  city: "",
  country: "",
  skills: "",
};

interface FilterDraft {
  remote: boolean;
  seniority: string;
  employmentType: string;
  minSalary: string;
  maxSalary: string;
  postedWithin: string;
  city: string;
  country: string;
  skills: string;
}

function filtersToDraft(filters: JobFilters): FilterDraft {
  return {
    remote: filters.remote === true,
    seniority: filters.seniority ?? "",
    employmentType: filters.employmentType ?? "",
    minSalary: filters.minSalary !== undefined ? String(filters.minSalary) : "",
    maxSalary: filters.maxSalary !== undefined ? String(filters.maxSalary) : "",
    postedWithin: dateToPostedWithinValue(filters.publishedSince),
    city: filters.city ?? "",
    country: filters.country ?? "",
    skills: filters.skills?.join(", ") ?? "",
  };
}

function draftToPartialFilters(draft: FilterDraft): Partial<JobFilters> {
  const minSalary = draft.minSalary.trim() ? Number(draft.minSalary) : undefined;
  const maxSalary = draft.maxSalary.trim() ? Number(draft.maxSalary) : undefined;
  const skills = draft.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    remote: draft.remote ? true : undefined,
    seniority: draft.seniority || undefined,
    employmentType: draft.employmentType || undefined,
    minSalary: minSalary !== undefined && Number.isFinite(minSalary) ? minSalary : undefined,
    maxSalary: maxSalary !== undefined && Number.isFinite(maxSalary) ? maxSalary : undefined,
    publishedSince: postedWithinToDate(draft.postedWithin),
    city: draft.city.trim() || undefined,
    country: draft.country.trim() || undefined,
    skills: skills.length > 0 ? skills : undefined,
  };
}

interface FilterPanelProps {
  filters: JobFilters;
  onApply: (partial: Partial<JobFilters>) => void;
  onClear: () => void;
  /** Called after a successful apply — the mobile drawer uses this to close itself. */
  onApplied?: () => void;
}

/**
 * The filter form, shared by the mobile drawer and the desktop sidebar
 * (brief §3: "one FilterPanel, two containers"). Edits are staged locally
 * and only committed on "Apply filters" — this keeps every keystroke from
 * triggering a ~4s API request and matches §16's "meaningful interactions,
 * not every internal state update".
 */
export default function FilterPanel({ filters, onApply, onClear, onApplied }: FilterPanelProps) {
  const [draft, setDraft] = useState<FilterDraft>(() => filtersToDraft(filters));

  const salaryRangeInvalid = useMemo(() => {
    const min = draft.minSalary.trim() ? Number(draft.minSalary) : undefined;
    const max = draft.maxSalary.trim() ? Number(draft.maxSalary) : undefined;
    return min !== undefined && max !== undefined && Number.isFinite(min) && Number.isFinite(max) && min > max;
  }, [draft.minSalary, draft.maxSalary]);

  const update = <K extends keyof FilterDraft>(key: K, value: FilterDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => {
    if (salaryRangeInvalid) return;
    const partial = draftToPartialFilters(draft);
    for (const change of diffFilterChanges(filters, partial)) {
      analytics.track("filter_used", change);
    }
    onApply(partial);
    onApplied?.();
  };

  const handleClear = () => {
    setDraft(EMPTY_DRAFT);
    onClear();
    onApplied?.();
  };

  return (
    <Stack spacing={2.5} sx={{ p: { xs: 2, md: 0 } }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={draft.remote}
            onChange={(e) => update("remote", e.target.checked)}
          />
        }
        label="Remote only"
      />

      <TextField
        select
        label="Seniority"
        size="small"
        value={draft.seniority}
        onChange={(e) => update("seniority", e.target.value)}
      >
        <MenuItem value="">Any</MenuItem>
        {SENIORITY_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Employment type"
        size="small"
        value={draft.employmentType}
        onChange={(e) => update("employmentType", e.target.value)}
      >
        <MenuItem value="">Any</MenuItem>
        {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Posted"
        size="small"
        value={draft.postedWithin}
        onChange={(e) => update("postedWithin", e.target.value)}
      >
        {POSTED_WITHIN_OPTIONS.map((opt) => (
          <MenuItem key={opt.value || "any"} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </TextField>

      <Stack direction="row" spacing={1.5}>
        <TextField
          label="Min salary"
          size="small"
          type="number"
          inputProps={{ min: 0 }}
          value={draft.minSalary}
          onChange={(e) => update("minSalary", e.target.value)}
          error={salaryRangeInvalid}
        />
        <TextField
          label="Max salary"
          size="small"
          type="number"
          inputProps={{ min: 0 }}
          value={draft.maxSalary}
          onChange={(e) => update("maxSalary", e.target.value)}
          error={salaryRangeInvalid}
          helperText={salaryRangeInvalid ? "Max must be ≥ min" : undefined}
        />
      </Stack>

      <Accordion
        disableGutters
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", "&:before": { display: "none" } }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            More filters
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Typography variant="caption" color="text.secondary">
              City, country and skills are supported by search, though most listings in this
              dataset don't carry them yet.
            </Typography>
            <TextField
              label="City"
              size="small"
              value={draft.city}
              onChange={(e) => update("city", e.target.value)}
            />
            <TextField
              label="Country"
              size="small"
              value={draft.country}
              onChange={(e) => update("country", e.target.value)}
            />
            <TextField
              label="Skills"
              size="small"
              placeholder="React, TypeScript"
              helperText="Comma-separated"
              value={draft.skills}
              onChange={(e) => update("skills", e.target.value)}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Stack direction="row" spacing={1.5}>
        <Button variant="contained" fullWidth onClick={handleApply} disabled={salaryRangeInvalid}>
          Apply filters
        </Button>
        <Button variant="text" onClick={handleClear}>
          Reset
        </Button>
      </Stack>
    </Stack>
  );
}
