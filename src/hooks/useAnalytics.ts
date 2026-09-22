import { analytics } from "../analytics/analytics";

/** Thin hook wrapper so components consume analytics the idiomatic React
 * way without reaching into `src/analytics` directly. */
export function useAnalytics(): typeof analytics {
  return analytics;
}
