import { useEffect, useState } from "react";
import { fetchJobs } from "../api/jobs";
import { ApiError } from "../api/client";
import { serializeFiltersToApiParams } from "../schemas/filters";
import type { JobFilters } from "../types/filters";
import type { JobListResponse } from "../types/job";

type Status = "loading" | "success" | "error";

export interface UseJobsResult {
  /** The most recently loaded page, kept visible (dimmed by the caller via
   * `isFetching`) while a new request is in flight — the board never
   * blanks or reflows on a filter change. */
  data: JobListResponse | null;
  status: Status;
  error: ApiError | null;
  isFetching: boolean;
  retry: () => void;
}

interface CacheEntry {
  data: JobListResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 20;
const cache = new Map<string, CacheEntry>();

function cacheKey(filters: JobFilters): string {
  return new URLSearchParams(serializeFiltersToApiParams(filters)).toString();
}

function getFromCache(key: string): JobListResponse | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  cache.delete(key);
  cache.set(key, entry); // refresh recency
  return entry.data;
}

function putInCache(key: string, data: JobListResponse): void {
  cache.set(key, { data, timestamp: Date.now() });
  while (cache.size > CACHE_MAX_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) break;
    cache.delete(oldestKey);
  }
}

/** Fetches the job list for the given filters, with request cancellation,
 * a short-lived cache (this API takes 3.5–4.6s per request), and
 * keep-previous-data semantics. */
export function useJobs(filters: JobFilters): UseJobsResult {
  const key = cacheKey(filters);
  const [data, setData] = useState<JobListResponse | null>(() => getFromCache(key));
  const [status, setStatus] = useState<Status>(data ? "success" : "loading");
  const [error, setError] = useState<ApiError | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    const cached = getFromCache(key);
    if (cached) {
      setData(cached);
      setStatus("success");
      setError(null);
    } else {
      setStatus("loading");
    }

    const controller = new AbortController();
    setIsFetching(true);

    fetchJobs(filters, { signal: controller.signal })
      .then((response) => {
        putInCache(key, response);
        setData(response);
        setStatus("success");
        setError(null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setStatus("error");
        setError(err instanceof ApiError ? err : new ApiError("server", "Something went wrong."));
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsFetching(false);
      });

    return () => controller.abort();
    // `filters` is intentionally omitted: `key` is derived from exactly the
    // fields that affect the request, so any two `filters` values sharing a
    // `key` produce an identical outgoing request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, retryToken]);

  const retry = () => setRetryToken((t) => t + 1);

  return { data, status, error, isFetching, retry };
}
