/**
 * Extracts a hostname from a URL only if it's a well-formed `https:` URL —
 * used to show where a mock "apply" flow would have continued, as inert
 * text, never as something the app navigates to on its own (brief §14: no
 * arbitrary redirect built from untrusted API data).
 */
export function safeHttpsHostname(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return null;
    return parsed.hostname;
  } catch {
    return null;
  }
}
