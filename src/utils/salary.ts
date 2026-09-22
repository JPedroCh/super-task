import type { Job } from "../types/job";

/**
 * Formats a job's salary range for display. Returns null when neither
 * bound is present (46% of jobs in the live dataset have no salary at
 * all). Deliberately does not attempt cross-currency conversion — the
 * dataset mixes USD/EUR/INR/CAD/GBP and we have no exchange-rate source,
 * so a converted figure would be an invented number.
 */
export function formatSalary(salary: Job["salary"] | null | undefined): string | null {
  if (!salary) return null;
  const { min, max, currency, period } = salary;
  if (min == null && max == null) return null;

  const format = (value: number): string => {
    if (currency) {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(value);
      } catch {
        // Not a recognized ISO 4217 code — fall through to a plain number.
      }
    }
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  };

  const periodLabel = period === "yearly" ? "/yr" : period ? `/${period}` : "";

  if (min != null && max != null && min !== max) {
    return `${format(min)} – ${format(max)}${periodLabel}`;
  }
  return `${format((min ?? max) as number)}${periodLabel}`;
}
