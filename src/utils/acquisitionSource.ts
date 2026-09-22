export type AcquisitionSource = "google" | "direct" | "linkedin" | "indeed" | "other";

const KNOWN_UTM_SOURCES: Record<string, AcquisitionSource> = {
  google: "google",
  linkedin: "linkedin",
  indeed: "indeed",
};

function classifyReferrerHost(hostname: string): AcquisitionSource | null {
  const host = hostname.toLowerCase();
  if (host.includes("google.")) return "google";
  if (host.includes("linkedin.")) return "linkedin";
  if (host.includes("indeed.")) return "indeed";
  return null;
}

/**
 * Pure resolution of a session's acquisition source. Order of precedence:
 * 1. `utm_source` on the landing URL, mapped to a known source or "other".
 * 2. The document referrer's host, when it's an external, recognizable site.
 * 3. "direct" — used only when neither signal is present, never guessed.
 */
export function resolveAcquisitionSource(
  searchParams: URLSearchParams,
  referrer: string,
  currentHost: string
): AcquisitionSource {
  const utmSource = searchParams.get("utm_source");
  if (utmSource) {
    const key = utmSource.trim().toLowerCase();
    return KNOWN_UTM_SOURCES[key] ?? "other";
  }

  if (referrer) {
    try {
      const referrerUrl = new URL(referrer);
      if (referrerUrl.hostname === currentHost) return "direct";
      return classifyReferrerHost(referrerUrl.hostname) ?? "other";
    } catch {
      // Malformed referrer string — fall through to "direct".
    }
  }

  return "direct";
}
