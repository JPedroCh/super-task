import { useEffect, useState } from "react";
import { fetchJobById } from "../api/jobs";
import { ApiError } from "../api/client";
import type { Job } from "../types/job";

type Status = "loading" | "success" | "error";

export interface UseJobResult {
  data: Job | null;
  status: Status;
  error: ApiError | null;
  retry: () => void;
}

interface CacheEntry {
  data: Job;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

export function useJob(jobId: string | undefined): UseJobResult {
  const [data, setData] = useState<Job | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<ApiError | null>(null);
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!jobId) {
      setData(null);
      setStatus("error");
      setError(new ApiError("invalidId", "That job link looks invalid."));
      return;
    }

    const cached = cache.get(jobId);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      setData(cached.data);
      setStatus("success");
      setError(null);
      return;
    }

    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    fetchJobById(jobId, { signal: controller.signal })
      .then((job) => {
        cache.set(jobId, { data: job, timestamp: Date.now() });
        setData(job);
        setStatus("success");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setStatus("error");
        setData(null);
        setError(err instanceof ApiError ? err : new ApiError("server", "Something went wrong."));
      });

    return () => controller.abort();
  }, [jobId, retryToken]);

  const retry = () => setRetryToken((t) => t + 1);

  return { data, status, error, retry };
}
