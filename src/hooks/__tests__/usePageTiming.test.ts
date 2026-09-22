import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { StrictMode } from "react";
import { renderHook, act } from "@testing-library/react";
import { usePageTiming } from "../usePageTiming";
import { analytics } from "../../analytics/analytics";

beforeEach(() => {
  analytics.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("usePageTiming", () => {
  it("emits exactly one page_viewed for a single mount", () => {
    const { unmount } = renderHook(() => usePageTiming("job_board"));
    expect(analytics.getEventsByName("page_viewed")).toHaveLength(1);
    unmount();
  });

  it("emits exactly one page_viewed and one page_time_spent through React StrictMode's dev double-invoke of effects", () => {
    vi.useFakeTimers();

    const { unmount } = renderHook(() => usePageTiming("job_board"), { wrapper: StrictMode });

    // StrictMode's synchronous mount -> cleanup -> mount has already
    // happened by the time render settles — only one page_viewed should
    // have been recorded, not two.
    expect(analytics.getEventsByName("page_viewed")).toHaveLength(1);

    act(() => {
      unmount();
      // The real unmount's cleanup defers its flush by one macrotask.
      vi.advanceTimersByTime(0);
    });

    expect(analytics.getEventsByName("page_time_spent")).toHaveLength(1);
  });

  it("does not double-count time when the tab is hidden and then the page unmounts", () => {
    vi.useFakeTimers();
    const { unmount } = renderHook(() => usePageTiming("job_details"));

    act(() => {
      Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(analytics.getEventsByName("page_time_spent")).toHaveLength(1);

    act(() => {
      unmount();
      vi.advanceTimersByTime(0);
    });

    // The unmount's deferred flush is a no-op — already emitted on hide.
    expect(analytics.getEventsByName("page_time_spent")).toHaveLength(1);
  });
});
