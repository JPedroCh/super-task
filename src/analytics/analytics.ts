import { mockPostHog } from "./mockPostHog";
import { getAcquisitionSource, getSessionId } from "./session";
import { getCurrentDeviceType } from "../utils/device";
import type { AnalyticsEvent, AnalyticsEventName, AnalyticsEventPropsMap } from "./types";

/**
 * The only analytics API components should ever import. It hides which
 * provider is behind it — today `mockPostHog`, swapping in real PostHog
 * later means changing this file alone.
 */
function track<Name extends AnalyticsEventName>(
  event: Name,
  properties: AnalyticsEventPropsMap[Name]
): void {
  const enriched: AnalyticsEvent<Name> = {
    event,
    properties: {
      ...properties,
      source: getAcquisitionSource(),
      deviceType: getCurrentDeviceType(),
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
    },
  };
  mockPostHog.capture(enriched as AnalyticsEvent);
}

export const analytics = {
  track,
  getEvents: () => mockPostHog.getEvents(),
  getEventsByName: mockPostHog.getEventsByName.bind(mockPostHog),
  subscribe: mockPostHog.subscribe.bind(mockPostHog),
  clear: () => mockPostHog.clear(),
};
