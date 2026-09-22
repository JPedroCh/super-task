import { apiClient, ApiError } from "./client";
import { JobSchema, JobListEnvelopeSchema, JobDetailSchema } from "../schemas/job";
import { serializeFiltersToApiParams } from "../schemas/filters";
import { analytics } from "../analytics/analytics";
import type { Job, JobListResponse } from "../types/job";
import type { JobFilters } from "../types/filters";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidJobId(id: string): boolean {
  return UUID_RE.test(id);
}

/**
 * Fetches the job list for the given filters. Validates the response
 * defensively: the `pagination` envelope must be well-formed, but each
 * job item is validated individually — a malformed record is dropped
 * (and reported) rather than blanking the whole page (brief §31).
 */
export async function fetchJobs(
  filters: JobFilters,
  options?: { signal?: AbortSignal }
): Promise<JobListResponse> {
  const params = serializeFiltersToApiParams(filters);
  const response = await apiClient.get("/api/public/jobs", { params, signal: options?.signal });

  const envelope = JobListEnvelopeSchema.safeParse(response.data);
  if (!envelope.success) {
    throw new ApiError("invalidResponse", "The jobs service returned an unexpected response.");
  }

  const items: Job[] = [];
  let droppedCount = 0;
  for (const raw of envelope.data.data) {
    const parsed = JobSchema.safeParse(raw);
    if (parsed.success) {
      items.push(parsed.data);
    } else {
      droppedCount += 1;
    }
  }

  if (droppedCount > 0) {
    console.warn(`[jobs api] dropped ${droppedCount} malformed job record(s) from the response`);
    analytics.track("api_response_invalid", { endpoint: "jobs_list", droppedCount });
  }

  return { data: items, pagination: envelope.data.pagination };
}

/**
 * Fetches a single job by id. The API distinguishes a malformed id (400,
 * "uuid is expected") from a well-formed but missing one (404) — this
 * mirrors that distinction so the UI can render "invalid link" separately
 * from "job not found". The UUID shape is checked client-side first so an
 * obviously invalid id never triggers a network round trip.
 */
export async function fetchJobById(id: string, options?: { signal?: AbortSignal }): Promise<Job> {
  if (!isValidJobId(id)) {
    throw new ApiError("invalidId", "That job link looks invalid.");
  }

  try {
    const response = await apiClient.get(`/api/public/jobs/${id}`, { signal: options?.signal });
    const parsed = JobDetailSchema.safeParse(response.data);
    if (!parsed.success) {
      throw new ApiError("invalidResponse", "The jobs service returned an unexpected response.");
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof ApiError && err.status === 400) {
      throw new ApiError("invalidId", "That job link looks invalid.", 400);
    }
    throw err;
  }
}
