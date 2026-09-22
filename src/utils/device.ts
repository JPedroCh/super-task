export type DeviceType = "mobile" | "tablet" | "desktop";

// Matches the MUI theme breakpoints used across the app (theme.ts).
const TABLET_MIN_WIDTH = 600;
const DESKTOP_MIN_WIDTH = 900;

export function getDeviceType(width: number): DeviceType {
  if (width < TABLET_MIN_WIDTH) return "mobile";
  if (width < DESKTOP_MIN_WIDTH) return "tablet";
  return "desktop";
}

/** Reads the current device type from the browser viewport. Falls back to
 * "desktop" outside a browser (SSR/tests) rather than throwing. */
export function getCurrentDeviceType(): DeviceType {
  if (typeof window === "undefined") return "desktop";
  return getDeviceType(window.innerWidth);
}
