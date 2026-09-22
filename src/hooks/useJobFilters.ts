import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseFiltersFromSearchParams, serializeFiltersToSearchParams } from "../schemas/filters";
import { withPreservedParams } from "../utils/preservedParams";
import type { JobFilters } from "../types/filters";

export interface UseJobFiltersResult {
  filters: JobFilters;
  /** Merges `next` into the current filters. Pass `undefined` for a field
   * to clear it. Resets to page 1 unless `resetPage: false` is passed. */
  setFilters: (next: Partial<JobFilters>, options?: { resetPage?: boolean }) => void;
  setPage: (pageNumber: number) => void;
  clearFilters: () => void;
}

/**
 * The single source of truth for filter state — wraps React Router's
 * `useSearchParams` so the URL stays authoritative (brief §6/§27): a
 * refresh, a shared link, or the back button all just re-read the URL.
 */
export function useJobFilters(): UseJobFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => parseFiltersFromSearchParams(searchParams), [searchParams]);

  const setFilters = useCallback(
    (next: Partial<JobFilters>, options?: { resetPage?: boolean }) => {
      setSearchParams(
        (prev) => {
          const current = parseFiltersFromSearchParams(prev);
          const merged: JobFilters = { ...current, ...next };
          if (options?.resetPage !== false) merged.pageNumber = 1;
          return withPreservedParams(serializeFiltersToSearchParams(merged), prev);
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (pageNumber: number) => {
      setSearchParams(
        (prev) => {
          const current = parseFiltersFromSearchParams(prev);
          const merged: JobFilters = { ...current, pageNumber };
          return withPreservedParams(serializeFiltersToSearchParams(merged), prev);
        },
        { replace: false }
      );
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams((prev) => withPreservedParams(new URLSearchParams(), prev), { replace: true });
  }, [setSearchParams]);

  return { filters, setFilters, setPage, clearFilters };
}
