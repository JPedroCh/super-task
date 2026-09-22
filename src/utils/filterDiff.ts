import type { JobFilters } from "../types/filters";

export interface FilterChange {
  filter: string;
  value: string;
}

const TRACKED_KEYS: (keyof JobFilters)[] = [
  "q",
  "remote",
  "seniority",
  "employmentType",
  "minSalary",
  "maxSalary",
  "publishedSince",
  "city",
  "country",
  "skills",
];

function normalize(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.join(",");
  return String(value);
}

/**
 * Produces one analytics-worthy change per filter key whose value actually
 * changed between the currently-committed filters and a newly-applied
 * partial. This is what keeps `filter_used` events meaningful rather than
 * firing one per keystroke or per internal draft update (brief §16).
 */
export function diffFilterChanges(previous: JobFilters, next: Partial<JobFilters>): FilterChange[] {
  const changes: FilterChange[] = [];
  for (const key of TRACKED_KEYS) {
    if (!(key in next)) continue;
    const before = normalize(previous[key]);
    const after = normalize(next[key]);
    if (before !== after) {
      changes.push({ filter: key, value: after || "(cleared)" });
    }
  }
  return changes;
}
