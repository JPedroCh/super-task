import { describe, it, expect } from "vitest";
import {
  computeBounceRate,
  computeAverageTimeOnPageMs,
  countEvent,
  segmentByDevice,
  segmentBySource,
} from "../metrics";
import type { AnalyticsEvent } from "../types";

function makeEvent<Name extends AnalyticsEvent["event"]>(
  event: Name,
  sessionId: string,
  overrides: Partial<AnalyticsEvent["properties"]> = {}
): AnalyticsEvent {
  return {
    event,
    properties: {
      source: "direct",
      deviceType: "mobile",
      sessionId,
      timestamp: new Date().toISOString(),
      ...overrides,
    },
  } as AnalyticsEvent;
}

describe("computeBounceRate", () => {
  it("returns null when there is no page-view data yet, rather than fabricating 0%", () => {
    expect(computeBounceRate([])).toBeNull();
  });

  it("counts a session with one page view and no meaningful interaction as a bounce", () => {
    const events = [makeEvent("page_viewed", "s1", { page: "job_details" })];
    expect(computeBounceRate(events)).toBe(1);
  });

  it("does not count a session with a meaningful interaction as a bounce, even with one page view", () => {
    const events = [
      makeEvent("page_viewed", "s1", { page: "job_details" }),
      makeEvent("apply_clicked", "s1", { jobId: "abc" }),
    ];
    expect(computeBounceRate(events)).toBe(0);
  });

  it("does not count a session with more than one page view as a bounce", () => {
    const events = [
      makeEvent("page_viewed", "s1", { page: "job_board" }),
      makeEvent("page_viewed", "s1", { page: "job_details" }),
    ];
    expect(computeBounceRate(events)).toBe(0);
  });

  it("computes the rate across multiple sessions", () => {
    const events = [
      makeEvent("page_viewed", "bounced", { page: "job_details" }),
      makeEvent("page_viewed", "engaged", { page: "job_details" }),
      makeEvent("filter_used", "engaged", { filter: "remote", value: "true" }),
    ];
    expect(computeBounceRate(events)).toBe(0.5);
  });
});

describe("computeAverageTimeOnPageMs", () => {
  it("returns null with no timing data", () => {
    expect(computeAverageTimeOnPageMs([])).toBeNull();
  });

  it("averages durationMs across all page_time_spent events", () => {
    const events = [
      makeEvent("page_time_spent", "s1", { page: "job_board", durationMs: 1000 }),
      makeEvent("page_time_spent", "s2", { page: "job_board", durationMs: 3000 }),
    ];
    expect(computeAverageTimeOnPageMs(events)).toBe(2000);
  });
});

describe("countEvent / segmentByDevice / segmentBySource", () => {
  const events = [
    makeEvent("job_detail_viewed", "s1", { jobId: "a", deviceType: "mobile", source: "google" }),
    makeEvent("job_detail_viewed", "s2", { jobId: "b", deviceType: "desktop", source: "direct" }),
    makeEvent("job_detail_viewed", "s3", { jobId: "c", deviceType: "mobile", source: "google" }),
    makeEvent("apply_clicked", "s1", { jobId: "a" }),
  ];

  it("counts only the requested event name", () => {
    expect(countEvent(events, "job_detail_viewed")).toBe(3);
    expect(countEvent(events, "apply_clicked")).toBe(1);
  });

  it("segments by device", () => {
    const byDevice = segmentByDevice(events, "job_detail_viewed");
    expect(byDevice).toEqual(
      expect.arrayContaining([
        { key: "mobile", count: 2 },
        { key: "desktop", count: 1 },
      ])
    );
  });

  it("segments by acquisition source", () => {
    const bySource = segmentBySource(events, "job_detail_viewed");
    expect(bySource).toEqual(
      expect.arrayContaining([
        { key: "google", count: 2 },
        { key: "direct", count: 1 },
      ])
    );
  });
});
