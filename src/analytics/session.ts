import { resolveAcquisitionSource, type AcquisitionSource } from "../utils/acquisitionSource";

const SOURCE_KEY = "mockPostHog:acquisitionSource";
const SESSION_ID_KEY = "mockPostHog:sessionId";

function safeSessionStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.sessionStorage : null;
  } catch {
    // Private-mode Safari and some locked-down browsers throw on access.
    return null;
  }
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

/** A stable id for this browser session, persisted so every event in the
 * session can be grouped together. */
export function getSessionId(): string {
  const storage = safeSessionStorage();
  if (!storage) return generateSessionId();

  const existing = storage.getItem(SESSION_ID_KEY);
  if (existing) return existing;

  const id = generateSessionId();
  try {
    storage.setItem(SESSION_ID_KEY, id);
  } catch {
    // Quota exceeded or storage disabled — fall back to in-memory only.
  }
  return id;
}

// Resolved once per page load and reused for every later call in this JS
// realm — see getAcquisitionSource for why this matters beyond a simple
// perf cache.
let cachedSource: AcquisitionSource | null = null;

/**
 * The session's acquisition source, resolved once on first read and
 * persisted for the rest of the session — so a user who lands via
 * `utm_source=google` and then clicks around the app internally keeps
 * "google" attributed to every subsequent event, not "direct".
 *
 * Resolution result is cached in memory in addition to sessionStorage.
 * That's not just a perf shortcut: `usePageTiming`'s `pagehide` handler
 * calls this during a real page unload, and re-deriving from
 * `window.location` at that moment reads a transitional URL — on some
 * timings the browser has already begun navigating away. Without this
 * cache, that flush could resolve (and persist) the wrong source for a
 * session whose real acquisition source hadn't been cached yet. The
 * in-memory value is set on this page's first call, always well before
 * any unload of *this* page can fire, so the unload path never re-derives.
 */
export function getAcquisitionSource(): AcquisitionSource {
  if (cachedSource) return cachedSource;
  if (typeof window === "undefined") return "direct";

  const storage = safeSessionStorage();
  if (storage) {
    const existing = storage.getItem(SOURCE_KEY);
    if (existing) {
      cachedSource = existing as AcquisitionSource;
      return cachedSource;
    }
  }

  const source = resolveAcquisitionSource(
    new URLSearchParams(window.location.search),
    document.referrer,
    window.location.hostname
  );
  cachedSource = source;

  try {
    storage?.setItem(SOURCE_KEY, source);
  } catch {
    // Ignore — the value is still returned for this call.
  }
  return source;
}

/** Test-only: clears the in-memory cache so each test can simulate a fresh
 * page load. Not used by application code. */
export function __resetAcquisitionSourceCacheForTests(): void {
  cachedSource = null;
}
