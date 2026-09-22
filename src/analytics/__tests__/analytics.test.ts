import { describe, it, expect, beforeEach } from "vitest";
import { analytics } from "../analytics";

beforeEach(() => {
  analytics.clear();
  window.sessionStorage.clear();
});

describe("analytics.track", () => {
  it("enriches every event with source, deviceType, sessionId and timestamp", () => {
    analytics.track("job_detail_viewed", { jobId: "abc-123" });

    const events = analytics.getEventsByName("job_detail_viewed");
    expect(events).toHaveLength(1);

    const { properties } = events[0];
    expect(properties.jobId).toBe("abc-123");
    expect(properties.source).toBeDefined();
    expect(["mobile", "tablet", "desktop"]).toContain(properties.deviceType);
    expect(typeof properties.sessionId).toBe("string");
    expect(properties.sessionId.length).toBeGreaterThan(0);
    expect(() => new Date(properties.timestamp).toISOString()).not.toThrow();
  });

  it("keeps the same sessionId across multiple track calls in one session", () => {
    analytics.track("search_performed", { query: "react" });
    analytics.track("apply_clicked", { jobId: "abc-123" });

    const events = analytics.getEvents();
    const sessionIds = new Set(events.map((e) => e.properties.sessionId));
    expect(sessionIds.size).toBe(1);
  });

  it("does not send data to any network endpoint — this is a mock provider only", () => {
    const originalFetch = globalThis.fetch;
    let called = false;
    globalThis.fetch = (() => {
      called = true;
      throw new Error("network should never be used by mock analytics");
    }) as typeof fetch;

    try {
      analytics.track("filter_used", { filter: "remote", value: "true" });
    } finally {
      globalThis.fetch = originalFetch;
    }

    expect(called).toBe(false);
  });
});
