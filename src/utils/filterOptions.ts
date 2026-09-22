import { isoDateDaysAgo } from "./date";
import type { JobFilters } from "../types/filters";

export const SENIORITY_OPTIONS = [
  { value: "EN", label: "Entry" },
  { value: "MI", label: "Mid" },
  { value: "SE", label: "Senior" },
  { value: "EX", label: "Executive" },
] as const;

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "Full Time", label: "Full time" },
  { value: "Contract", label: "Contract" },
  { value: "Part Time", label: "Part time" },
  { value: "Internship", label: "Internship" },
] as const;

export const SORT_OPTIONS = [
  { value: "publishedAt", label: "Date posted" },
  { value: "salary", label: "Salary" },
  { value: "title", label: "Title (A–Z)" },
] as const;

export const POSTED_WITHIN_OPTIONS = [
  { value: "", label: "Any time" },
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
] as const;

/** Converts a `POSTED_WITHIN_OPTIONS` value ("", "1", "7", "30") to the ISO
 * date the API's `publishedSince` param expects. */
export function postedWithinToDate(days: string): string | undefined {
  const n = Number(days);
  if (!days || !Number.isFinite(n) || n <= 0) return undefined;
  return isoDateDaysAgo(n);
}

/** The inverse — used to re-select the right option when filters come from
 * the URL. Since `publishedSince` is an arbitrary date, this only matches
 * when it lines up with one of our fixed buckets (today, minus a day of
 * client/server clock skew); anything else shows as "Any time" with the
 * underlying filter still applied via "More filters". */
export function dateToPostedWithinValue(publishedSince: string | undefined): string {
  if (!publishedSince) return "";
  for (const option of POSTED_WITHIN_OPTIONS) {
    if (!option.value) continue;
    if (postedWithinToDate(option.value) === publishedSince) return option.value;
  }
  return "";
}

/** Filter keys represented in the filter drawer/sidebar — excludes `q`,
 * which has its own always-visible search bar, and the pagination/sort
 * keys, which aren't "filters" in the UI sense. Shared by the active-filter
 * chip row and the drawer's badge count so they can never disagree. */
export const DRAWER_FILTER_KEYS: (keyof JobFilters)[] = [
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

export function countActiveDrawerFilters(filters: JobFilters): number {
  let count = 0;
  for (const key of DRAWER_FILTER_KEYS) {
    const value = filters[key];
    if (value === undefined || value === false) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    count += 1;
  }
  return count;
}
