import { describe, it, expect } from "vitest";
import { formatSalary } from "../salary";

describe("formatSalary", () => {
  it("returns null when neither bound is present (46% of the live dataset)", () => {
    expect(formatSalary(null)).toBeNull();
    expect(formatSalary({ min: null, max: null, currency: "USD", period: "yearly" })).toBeNull();
  });

  it("formats a min-max range with currency and period", () => {
    const result = formatSalary({ min: 62300, max: 93500, currency: "EUR", period: "yearly" });
    expect(result).toContain("62,300");
    expect(result).toContain("93,500");
    expect(result).toContain("/yr");
  });

  it("formats a single bound when only one is present", () => {
    const result = formatSalary({ min: 50000, max: null, currency: "USD", period: "yearly" });
    expect(result).toContain("50,000");
  });

  it("falls back to a plain number for an unrecognized currency code instead of throwing", () => {
    expect(() => formatSalary({ min: 1000, max: 2000, currency: "NOTACODE", period: "yearly" })).not.toThrow();
  });
});
