import { z } from "zod";

export const SORT_BY_VALUES = ["publishedAt", "salary", "title"] as const;
export const SORT_ORDER_VALUES = ["asc", "desc"] as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
export const DEFAULT_SORT_BY: (typeof SORT_BY_VALUES)[number] = "publishedAt";
export const DEFAULT_SORT_ORDER: (typeof SORT_ORDER_VALUES)[number] = "desc";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?Z?)?$/;

/**
 * The internal, already-validated filter model — this is what every hook
 * and component reads. All 14 documented API params are represented, even
 * though several (city, country, skills, category-adjacent fields) are
 * ~0% populated in the live dataset: the contract still requires support,
 * and a job that *does* carry one of these fields should still be
 * filterable by it.
 */
export const JobFiltersSchema = z
  .object({
    pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
    pageNumber: z.number().int().min(1).default(1),
    q: z.string().trim().min(1).optional(),
    city: z.string().trim().min(1).optional(),
    country: z.string().trim().min(1).optional(),
    remote: z.boolean().optional(),
    seniority: z.string().trim().min(1).optional(),
    employmentType: z.string().trim().min(1).optional(),
    skills: z.array(z.string().trim().min(1)).optional(),
    minSalary: z.number().int().min(0).optional(),
    maxSalary: z.number().int().min(0).optional(),
    publishedSince: z.string().regex(ISO_DATE_RE).optional(),
    sortBy: z.enum(SORT_BY_VALUES).default(DEFAULT_SORT_BY),
    sortOrder: z.enum(SORT_ORDER_VALUES).default(DEFAULT_SORT_ORDER),
  })
  .refine(
    (f) => f.minSalary === undefined || f.maxSalary === undefined || f.minSalary <= f.maxSalary,
    { message: "minSalary must be less than or equal to maxSalary", path: ["minSalary"] }
  );

function parseSkillsParam(sp: URLSearchParams): string[] {
  const out: string[] = [];
  for (const raw of sp.getAll("skills")) {
    for (const part of raw.split(",")) {
      const trimmed = part.trim();
      if (trimmed && !out.includes(trimmed)) out.push(trimmed);
    }
  }
  return out;
}

function parseIntParam(sp: URLSearchParams, key: string): number | undefined {
  const raw = sp.get(key);
  if (raw === null) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

/**
 * Reads filters out of a URLSearchParams object. Lenient by design: any
 * individual value that fails to parse is simply omitted (falling back to
 * its schema default) rather than throwing, so a hand-edited or stale
 * shared URL still renders a usable board instead of a crash.
 */
export function parseFiltersFromSearchParams(sp: URLSearchParams): import("../types/filters").JobFilters {
  const raw: Record<string, unknown> = {};

  const pageSize = parseIntParam(sp, "pageSize");
  if (pageSize !== undefined) raw.pageSize = pageSize;

  const pageNumber = parseIntParam(sp, "pageNumber");
  if (pageNumber !== undefined) raw.pageNumber = pageNumber;

  const q = sp.get("q");
  if (q) raw.q = q;

  const city = sp.get("city");
  if (city) raw.city = city;

  const country = sp.get("country");
  if (country) raw.country = country;

  const remote = sp.get("remote");
  if (remote !== null) raw.remote = remote === "true" || remote === "1";

  const seniority = sp.get("seniority");
  if (seniority) raw.seniority = seniority;

  const employmentType = sp.get("employmentType");
  if (employmentType) raw.employmentType = employmentType;

  const skills = parseSkillsParam(sp);
  if (skills.length > 0) raw.skills = skills;

  const minSalary = parseIntParam(sp, "minSalary");
  if (minSalary !== undefined) raw.minSalary = minSalary;

  const maxSalary = parseIntParam(sp, "maxSalary");
  if (maxSalary !== undefined) raw.maxSalary = maxSalary;

  const publishedSince = sp.get("publishedSince");
  if (publishedSince && ISO_DATE_RE.test(publishedSince)) raw.publishedSince = publishedSince;

  const sortBy = sp.get("sortBy");
  if (sortBy && (SORT_BY_VALUES as readonly string[]).includes(sortBy)) raw.sortBy = sortBy;

  const sortOrder = sp.get("sortOrder");
  if (sortOrder && (SORT_ORDER_VALUES as readonly string[]).includes(sortOrder)) raw.sortOrder = sortOrder;

  const parsed = JobFiltersSchema.safeParse(raw);
  if (parsed.success) return parsed.data;

  // Only remaining failure mode is the minSalary/maxSalary refinement.
  // Drop that range rather than discarding every other filter on the URL.
  delete raw.minSalary;
  delete raw.maxSalary;
  const fallback = JobFiltersSchema.safeParse(raw);
  return fallback.success ? fallback.data : JobFiltersSchema.parse({});
}

/**
 * Builds the param record shared by both the API request and the URL —
 * defaults are omitted (keeps URLs and requests short and avoids ever
 * depending on our defaults matching the API's), and `remote` is only ever
 * emitted as `"true"`: the API treats `remote` as a presence flag, so
 * `remote=false` would silently return the same remote-only results as
 * `remote=true`.
 */
function filtersToParamRecord(filters: import("../types/filters").JobFilters): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.q) params.q = filters.q;
  if (filters.city) params.city = filters.city;
  if (filters.country) params.country = filters.country;
  if (filters.remote === true) params.remote = "true";
  if (filters.seniority) params.seniority = filters.seniority;
  if (filters.employmentType) params.employmentType = filters.employmentType;
  if (filters.skills && filters.skills.length > 0) params.skills = filters.skills.join(",");
  if (filters.minSalary !== undefined) params.minSalary = String(filters.minSalary);
  if (filters.maxSalary !== undefined) params.maxSalary = String(filters.maxSalary);
  if (filters.publishedSince) params.publishedSince = filters.publishedSince;
  if (filters.sortBy !== DEFAULT_SORT_BY) params.sortBy = filters.sortBy;
  if (filters.sortOrder !== DEFAULT_SORT_ORDER) params.sortOrder = filters.sortOrder;
  if (filters.pageNumber !== 1) params.pageNumber = String(filters.pageNumber);
  if (filters.pageSize !== DEFAULT_PAGE_SIZE) params.pageSize = String(filters.pageSize);

  return params;
}

/**
 * Strict allowlist serialization for the outgoing API request. Only the 14
 * documented params can ever appear here — this is what prevents stray URL
 * params (utm_source, anything a user pastes in) from reaching the API,
 * which responds 400 to any unrecognized query key.
 */
export function serializeFiltersToApiParams(
  filters: import("../types/filters").JobFilters
): Record<string, string> {
  return filtersToParamRecord(filters);
}

/** Builds the shareable URL query string for the current filter state. */
export function serializeFiltersToSearchParams(
  filters: import("../types/filters").JobFilters
): URLSearchParams {
  return new URLSearchParams(filtersToParamRecord(filters));
}

/** True when no filter differs from its default (used to enable/disable "Clear filters"). */
export function hasActiveFilters(filters: import("../types/filters").JobFilters): boolean {
  return Object.keys(filtersToParamRecord(filters)).some((k) => k !== "pageNumber" && k !== "pageSize");
}

/**
 * Fills in defaults for a partial filter set (e.g. the handful of fields a
 * contextual chip or "Find similar jobs" cares about) and serializes it to
 * a query string — used to build `/jobs?...` links from the details page.
 */
export function partialFiltersToSearchParams(
  partial: Partial<import("../types/filters").JobFilters>
): URLSearchParams {
  const filters = JobFiltersSchema.parse(partial);
  return serializeFiltersToSearchParams(filters);
}
