const SENIORITY_LABELS: Record<string, string> = {
  EN: "Entry",
  MI: "Mid",
  SE: "Senior",
  EX: "Executive",
};

/** Maps the API's seniority code to a readable label. An unrecognized code
 * (the API may add values we haven't seen) passes through unchanged rather
 * than failing — never hide a real value because it doesn't match our map. */
export function formatSeniority(code: string | null | undefined): string | null {
  if (!code) return null;
  return SENIORITY_LABELS[code.toUpperCase()] ?? code;
}
