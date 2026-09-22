// utm_* params aren't part of the filter model, but must survive
// navigation between pages — filter edits and pagination on the board,
// and "Find similar jobs" / contextual chips from a job details page — so
// that a session's acquisition attribution is never lost by clicking
// around the app (brief §32: the example flow keeps `utm_source=google`
// all the way from the details page to the filtered board).
const PRESERVED_PARAM_PREFIXES = ["utm_"];

export function extractPreservedParams(source: URLSearchParams): [string, string][] {
  const preserved: [string, string][] = [];
  for (const [key, value] of source.entries()) {
    if (PRESERVED_PARAM_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      preserved.push([key, value]);
    }
  }
  return preserved;
}

/** Returns a new URLSearchParams combining `target` with any preserved
 * params (utm_*) found on `source`. */
export function withPreservedParams(target: URLSearchParams, source: URLSearchParams): URLSearchParams {
  const merged = new URLSearchParams(target);
  for (const [key, value] of extractPreservedParams(source)) {
    merged.set(key, value);
  }
  return merged;
}
