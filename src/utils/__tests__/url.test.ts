import { describe, it, expect } from "vitest";
import { safeHttpsHostname } from "../url";

describe("safeHttpsHostname", () => {
  it("extracts the hostname from a well-formed https URL", () => {
    expect(safeHttpsHostname("https://clio.wd3.myworkdayjobs.com/en-US/job/123")).toBe(
      "clio.wd3.myworkdayjobs.com"
    );
  });

  it("rejects a non-https URL", () => {
    expect(safeHttpsHostname("http://example.com")).toBeNull();
  });

  it("rejects a javascript: URL rather than throwing", () => {
    expect(safeHttpsHostname("javascript:alert(1)")).toBeNull();
  });

  it("returns null for a missing or malformed URL", () => {
    expect(safeHttpsHostname(null)).toBeNull();
    expect(safeHttpsHostname(undefined)).toBeNull();
    expect(safeHttpsHostname("not a url")).toBeNull();
  });
});
