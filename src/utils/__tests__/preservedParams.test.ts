import { describe, it, expect } from "vitest";
import { extractPreservedParams, withPreservedParams } from "../preservedParams";

describe("extractPreservedParams", () => {
  it("extracts only utm_* keys", () => {
    const sp = new URLSearchParams("utm_source=google&utm_campaign=spring&seniority=SE");
    expect(extractPreservedParams(sp)).toEqual([
      ["utm_source", "google"],
      ["utm_campaign", "spring"],
    ]);
  });

  it("returns an empty list when there are none", () => {
    expect(extractPreservedParams(new URLSearchParams("seniority=SE"))).toEqual([]);
  });
});

describe("withPreservedParams", () => {
  it("carries utm_source from the details page URL onto a newly built filter link — the §32 acceptance flow", () => {
    const detailsPageParams = new URLSearchParams("utm_source=google");
    const newFilterLink = new URLSearchParams("seniority=SE&employmentType=Full+Time");

    const result = withPreservedParams(newFilterLink, detailsPageParams);

    expect(result.get("utm_source")).toBe("google");
    expect(result.get("seniority")).toBe("SE");
    expect(result.get("employmentType")).toBe("Full Time");
  });

  it("does not mutate the target passed in", () => {
    const target = new URLSearchParams("seniority=SE");
    withPreservedParams(target, new URLSearchParams("utm_source=google"));
    expect(target.get("utm_source")).toBeNull();
  });

  it("lets an explicit value on the target win if both define the same key", () => {
    const target = new URLSearchParams("utm_source=direct");
    const source = new URLSearchParams("utm_source=google");
    // Preserved params intentionally overwrite — the source (current URL)
    // is the session's attribution of record.
    expect(withPreservedParams(target, source).get("utm_source")).toBe("google");
  });
});
