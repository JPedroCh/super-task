import type { AnalyticsEvent, AnalyticsEventName } from "./types";
import { MEANINGFUL_INTERACTION_EVENTS } from "./types";
import type { AcquisitionSource } from "../utils/acquisitionSource";
import type { DeviceType } from "../utils/device";

interface SessionSummary {
  sessionId: string;
  source: AcquisitionSource;
  deviceType: DeviceType;
  pageViews: number;
  hadMeaningfulInteraction: boolean;
}

function summarizeSessions(events: readonly AnalyticsEvent[]): SessionSummary[] {
  const bySession = new Map<string, SessionSummary>();
  const meaningful: readonly string[] = MEANINGFUL_INTERACTION_EVENTS;

  for (const e of events) {
    const { sessionId, source, deviceType } = e.properties;
    let summary = bySession.get(sessionId);
    if (!summary) {
      summary = { sessionId, source, deviceType, pageViews: 0, hadMeaningfulInteraction: false };
      bySession.set(sessionId, summary);
    }
    if (e.event === "page_viewed") summary.pageViews += 1;
    if (meaningful.includes(e.event)) summary.hadMeaningfulInteraction = true;
  }

  return [...bySession.values()];
}

/**
 * Bounce rate per the definition in analytics/types.ts: sessions with
 * exactly one page view and no meaningful interaction, over all sessions
 * that recorded at least one page view. Returns null (not 0) when there's
 * no data yet — a dashboard showing "0%" from zero sessions would be a
 * fabricated number, not a measurement.
 */
export function computeBounceRate(events: readonly AnalyticsEvent[]): number | null {
  const sessions = summarizeSessions(events).filter((s) => s.pageViews > 0);
  if (sessions.length === 0) return null;
  const bounced = sessions.filter((s) => s.pageViews === 1 && !s.hadMeaningfulInteraction);
  return bounced.length / sessions.length;
}

export function computeAverageTimeOnPageMs(events: readonly AnalyticsEvent[]): number | null {
  const timings = events.filter(
    (e): e is AnalyticsEvent<"page_time_spent"> => e.event === "page_time_spent"
  );
  if (timings.length === 0) return null;
  const total = timings.reduce((sum, e) => sum + e.properties.durationMs, 0);
  return total / timings.length;
}

export function countEvent(events: readonly AnalyticsEvent[], name: AnalyticsEventName): number {
  return events.filter((e) => e.event === name).length;
}

export interface SegmentBreakdown<K extends string> {
  key: K;
  count: number;
}

export function segmentByDevice(
  events: readonly AnalyticsEvent[],
  name: AnalyticsEventName
): SegmentBreakdown<DeviceType>[] {
  const counts = new Map<DeviceType, number>();
  for (const e of events) {
    if (e.event !== name) continue;
    counts.set(e.properties.deviceType, (counts.get(e.properties.deviceType) ?? 0) + 1);
  }
  return [...counts.entries()].map(([key, count]) => ({ key, count }));
}

export function segmentBySource(
  events: readonly AnalyticsEvent[],
  name: AnalyticsEventName
): SegmentBreakdown<AcquisitionSource>[] {
  const counts = new Map<AcquisitionSource, number>();
  for (const e of events) {
    if (e.event !== name) continue;
    counts.set(e.properties.source, (counts.get(e.properties.source) ?? 0) + 1);
  }
  return [...counts.entries()].map(([key, count]) => ({ key, count }));
}
