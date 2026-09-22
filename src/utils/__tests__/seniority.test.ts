import { describe, it, expect } from "vitest";
import { formatSeniority } from "../seniority";

describe("formatSeniority", () => {
  it("maps every documented API code to a readable label", () => {
    expect(formatSeniority("EN")).toBe("Entry");
    expect(formatSeniority("MI")).toBe("Mid");
    expect(formatSeniority("SE")).toBe("Senior");
    expect(formatSeniority("EX")).toBe("Executive");
  });

  it("is case-insensitive", () => {
    expect(formatSeniority("se")).toBe("Senior");
  });

  it("passes an unrecognized code through unchanged rather than hiding it", () => {
    expect(formatSeniority("LEAD")).toBe("LEAD");
  });

  it("returns null for a missing code", () => {
    expect(formatSeniority(null)).toBeNull();
    expect(formatSeniority(undefined)).toBeNull();
  });
});
