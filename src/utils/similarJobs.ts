import type { Job } from "../types/job";
import type { JobFilters } from "../types/filters";

const TITLE_NOISE_WORDS = new Set([
  "senior",
  "sr",
  "sr.",
  "junior",
  "jr",
  "jr.",
  "staff",
  "principal",
  "lead",
  "entry",
  "entry-level",
  "mid",
  "mid-level",
  "associate",
  "intern",
  "internship",
  "i",
  "ii",
  "iii",
  "iv",
  "v",
]);

const MAX_KEYWORD_WORDS = 3;

/**
 * Pulls a search keyword out of a job title by dropping a single leading
 * seniority/noise word, then capping to a few words. The result stays a
 * contiguous substring of the original title (word order preserved) so it
 * still matches the API's title-substring search — e.g. "Senior React
 * Developer" -> "React Developer", which is guaranteed to appear verbatim
 * in the source title.
 */
export function extractTitleKeyword(title: string): string | undefined {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return undefined;

  let start = 0;
  const normalize = (w: string) => w.toLowerCase().replace(/[^a-z0-9.-]/gi, "");
  if (words.length > 1 && TITLE_NOISE_WORDS.has(normalize(words[0]))) {
    start = 1;
  }

  const phrase = words.slice(start, start + MAX_KEYWORD_WORDS).join(" ").trim();
  return phrase.length > 0 ? phrase : undefined;
}

/**
 * Builds the filter set for "Find similar jobs": seniority, employment
 * type, remote (only when true — see the filters schema for why `false`
 * is never sent), up to 3 skills when the job has any, and a keyword
 * pulled from the title. Deliberately does not use every field on the
 * job — city/country/category are effectively unpopulated in this
 * dataset, and stacking every possible constraint returns almost nothing.
 */
export function buildSimilarJobsFilters(job: Job): Partial<JobFilters> {
  const result: Partial<JobFilters> = {};

  if (job.seniority) result.seniority = job.seniority;
  if (job.employmentType) result.employmentType = job.employmentType;
  if (job.location?.isRemote) result.remote = true;
  if (job.skills && job.skills.length > 0) result.skills = job.skills.slice(0, 3);

  const keyword = extractTitleKeyword(job.title);
  if (keyword) result.q = keyword;

  return result;
}

export interface ContextualFilterChip {
  label: string;
  filters: Partial<JobFilters>;
}

/**
 * One chip per field this specific job actually has — never a fixed list,
 * since most jobs in this dataset don't carry city/country/skills/category.
 */
export function buildContextualFilterChips(job: Job, seniorityLabel: string | null): ContextualFilterChip[] {
  const chips: ContextualFilterChip[] = [];

  if (job.seniority && seniorityLabel) {
    chips.push({ label: seniorityLabel, filters: { seniority: job.seniority } });
  }
  if (job.employmentType) {
    chips.push({ label: job.employmentType, filters: { employmentType: job.employmentType } });
  }
  if (job.location?.isRemote) {
    chips.push({ label: "Remote", filters: { remote: true } });
  }
  if (job.location?.city) {
    chips.push({ label: job.location.city, filters: { city: job.location.city } });
  }
  if (job.location?.country) {
    chips.push({ label: job.location.country, filters: { country: job.location.country } });
  }
  for (const skill of job.skills ?? []) {
    chips.push({ label: skill, filters: { skills: [skill] } });
  }

  return chips;
}
