import type { AcquisitionSource } from "../utils/acquisitionSource";
import type { DeviceType } from "../utils/device";

/**
 * Every event this app can emit, and the properties the caller supplies.
 * `source`, `deviceType`, `sessionId` and `timestamp` are added
 * automatically by analytics.ts — callers never pass them.
 *
 * `page_viewed` is not in the brief's explicit event list (§16-19) but is
 * the supporting infrastructure §17/§18 assume exists: bounce rate and
 * time-on-page can't be computed without a page-view signal for every
 * route, not just job details.
 */
export interface AnalyticsEventPropsMap {
  page_viewed: { page: string };
  page_time_spent: { page: string; durationMs: number };
  job_detail_viewed: { jobId: string };
  job_card_clicked: { jobId: string; position?: number };
  search_performed: { query: string; resultCount?: number };
  filter_used: { filter: string; value: string };
  apply_clicked: { jobId: string };
  signup_viewed: Record<string, never>;
  signup_started: Record<string, never>;
  signup_submitted: Record<string, never>;
  signup_completed: Record<string, never>;
  external_apply_viewed: { jobId: string };
  external_apply_started: { jobId: string };
  external_apply_submitted: { jobId: string };
  api_response_invalid: { endpoint: string; droppedCount?: number };
}

export type AnalyticsEventName = keyof AnalyticsEventPropsMap;

export interface EnrichedEventProperties {
  source: AcquisitionSource;
  deviceType: DeviceType;
  sessionId: string;
  timestamp: string;
}

export interface AnalyticsEvent<Name extends AnalyticsEventName = AnalyticsEventName> {
  event: Name;
  properties: AnalyticsEventPropsMap[Name] & EnrichedEventProperties;
}

/**
 * A session "bounce" is defined explicitly (per §17, this must not be
 * asserted implicitly): a session with exactly one page view and none of
 * these meaningful-interaction events before leaving. `job_detail_viewed`
 * is intentionally excluded — arriving on a detail page and leaving
 * without acting on it (filtering, applying, searching) is the bounce
 * this metric exists to catch, not evidence against it.
 */
export const MEANINGFUL_INTERACTION_EVENTS = [
  "filter_used",
  "search_performed",
  "job_card_clicked",
  "apply_clicked",
  "signup_started",
  "signup_submitted",
  "external_apply_started",
  "external_apply_submitted",
] as const satisfies readonly AnalyticsEventName[];
