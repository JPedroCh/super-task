import { useEffect, useRef } from "react";
import { analytics } from "../analytics/analytics";

/**
 * Fires `page_viewed` on mount and `page_time_spent` exactly once when the
 * page is left — on tab hide, on browser/tab close (`pagehide`), or on
 * unmount (internal navigation to another route).
 *
 * React 19 StrictMode double-invokes effects in dev (mount → cleanup →
 * mount, synchronously in the same tick). A naive implementation would
 * fire two `page_viewed`/`page_time_spent` pairs for one real page view.
 * The fix: defer the "left the page" flush by one macrotask on cleanup: a
 * StrictMode remount happening before that macrotask runs cancels the
 * pending flush and keeps the original start time, so only a genuine
 * unmount ever emits.
 *
 * Trade-off: only the *first* hide/unmount emits (guarded by
 * `emittedRef`) — if a user backgrounds the tab and later returns before
 * truly leaving, the recorded duration stops at the first hide. That's an
 * acceptable approximation for this mock layer, not a real browser-level
 * bounce/timing measurement (brief §17 asks us not to overclaim that).
 */
export function usePageTiming(page: string): void {
  const startRef = useRef(0);
  const emittedRef = useRef(false);
  const cancelPendingFlushRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (cancelPendingFlushRef.current) {
      // A StrictMode phantom-unmount scheduled a flush earlier in this
      // tick — cancel it and keep counting from the original start time.
      cancelPendingFlushRef.current();
      cancelPendingFlushRef.current = null;
    } else {
      startRef.current = performance.now();
      emittedRef.current = false;
      analytics.track("page_viewed", { page });
    }

    const flush = () => {
      if (emittedRef.current) return;
      emittedRef.current = true;
      const durationMs = Math.round(performance.now() - startRef.current);
      analytics.track("page_time_spent", { page, durationMs });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", flush);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", flush);

      const timeoutId = window.setTimeout(flush, 0);
      cancelPendingFlushRef.current = () => window.clearTimeout(timeoutId);
    };
  }, [page]);
}
