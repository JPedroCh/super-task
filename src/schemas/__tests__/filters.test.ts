import { describe, it, expect } from "vitest";
import {
  JobFiltersSchema,
  parseFiltersFromSearchParams,
  serializeFiltersToApiParams,
  hasActiveFilters,
} from "../filters";

describe("parseFiltersFromSearchParams", () => {
  it("applies documented defaults when the URL has no filters", () => {
    const filters = parseFiltersFromSearchParams(new URLSearchParams());
    expect(filters.pageSize).toBe(20);
    expect(filters.pageNumber).toBe(1);
    expect(filters.sortBy).toBe("publishedAt");
    expect(filters.sortOrder).toBe("desc");
    expect(filters.remote).toBeUndefined();
  });

  it("round-trips through serialize -> parse for a full filter set", () => {
    const original = JobFiltersSchema.parse({
      q: "engineer",
      city: "London",
      country: "UK",
      remote: true,
      seniority: "SE",
      employmentType: "Full Time",
      skills: ["React", "TypeScript"],
      minSalary: 50000,
      maxSalary: 120000,
      publishedSince: "2026-01-01",
      sortBy: "salary",
      sortOrder: "asc",
      pageNumber: 3,
      pageSize: 10,
    });

    const sp = new URLSearchParams(serializeFiltersToApiParams(original));
    const parsed = parseFiltersFromSearchParams(sp);

    expect(parsed).toEqual(original);
  });

  it("clamps pageSize to the documented 1-50 range by falling back to default when out of range", () => {
    const tooLarge = parseFiltersFromSearchParams(new URLSearchParams("pageSize=200"));
    expect(tooLarge.pageSize).toBe(20);

    const tooSmall = parseFiltersFromSearchParams(new URLSearchParams("pageSize=0"));
    expect(tooSmall.pageSize).toBe(20);

    const valid = parseFiltersFromSearchParams(new URLSearchParams("pageSize=50"));
    expect(valid.pageSize).toBe(50);
  });

  it("parses comma-separated and repeated skills identically, deduped", () => {
    const commaSeparated = parseFiltersFromSearchParams(new URLSearchParams("skills=React,TypeScript"));
    const repeated = parseFiltersFromSearchParams(new URLSearchParams("skills=React&skills=TypeScript"));
    const withDuplicate = parseFiltersFromSearchParams(new URLSearchParams("skills=React,React,TypeScript"));

    expect(commaSeparated.skills).toEqual(["React", "TypeScript"]);
    expect(repeated.skills).toEqual(["React", "TypeScript"]);
    expect(withDuplicate.skills).toEqual(["React", "TypeScript"]);
  });

  it("drops an invalid minSalary/maxSalary range rather than discarding every other filter", () => {
    const sp = new URLSearchParams("minSalary=200000&maxSalary=1000&city=London&q=react");
    const filters = parseFiltersFromSearchParams(sp);

    expect(filters.minSalary).toBeUndefined();
    expect(filters.maxSalary).toBeUndefined();
    expect(filters.city).toBe("London");
    expect(filters.q).toBe("react");
  });

  it("falls back to defaults for unparseable field values instead of throwing", () => {
    const sp = new URLSearchParams("sortBy=bogus&sortOrder=sideways&pageNumber=not-a-number");
    const filters = parseFiltersFromSearchParams(sp);

    expect(filters.sortBy).toBe("publishedAt");
    expect(filters.sortOrder).toBe("desc");
    expect(filters.pageNumber).toBe(1);
  });
});

describe("serializeFiltersToApiParams", () => {
  it("never emits a key outside the 14 documented API params — the allowlist that prevents the API's 400 on unknown params", () => {
    const ALLOWED = new Set([
      "pageSize",
      "pageNumber",
      "q",
      "city",
      "country",
      "remote",
      "seniority",
      "employmentType",
      "skills",
      "minSalary",
      "maxSalary",
      "publishedSince",
      "sortBy",
      "sortOrder",
    ]);

    const filters = JobFiltersSchema.parse({
      q: "engineer",
      city: "London",
      remote: false,
      seniority: "SE",
    });

    const params = serializeFiltersToApiParams(filters);
    for (const key of Object.keys(params)) {
      expect(ALLOWED.has(key)).toBe(true);
    }
  });

  it("omits remote entirely when false — the API treats remote as a presence flag, so remote=false silently returns remote-only results", () => {
    const filters = JobFiltersSchema.parse({ remote: false });
    const params = serializeFiltersToApiParams(filters);
    expect(params.remote).toBeUndefined();
  });

  it("sends remote=true only when explicitly opted in", () => {
    const filters = JobFiltersSchema.parse({ remote: true });
    const params = serializeFiltersToApiParams(filters);
    expect(params.remote).toBe("true");
  });

  it("omits default pageSize/pageNumber/sortBy/sortOrder to keep requests minimal", () => {
    const filters = JobFiltersSchema.parse({});
    const params = serializeFiltersToApiParams(filters);
    expect(params).toEqual({});
  });

  it("joins skills with commas", () => {
    const filters = JobFiltersSchema.parse({ skills: ["React", "TypeScript"] });
    const params = serializeFiltersToApiParams(filters);
    expect(params.skills).toBe("React,TypeScript");
  });
});

describe("JobFiltersSchema", () => {
  it("rejects minSalary greater than maxSalary", () => {
    const result = JobFiltersSchema.safeParse({ minSalary: 200000, maxSalary: 1000 });
    expect(result.success).toBe(false);
  });

  it("accepts minSalary equal to maxSalary", () => {
    const result = JobFiltersSchema.safeParse({ minSalary: 50000, maxSalary: 50000 });
    expect(result.success).toBe(true);
  });

  it("rejects a pageSize above the documented max of 50", () => {
    const result = JobFiltersSchema.safeParse({ pageSize: 51 });
    expect(result.success).toBe(false);
  });
});

describe("hasActiveFilters", () => {
  it("is false for default filters", () => {
    expect(hasActiveFilters(JobFiltersSchema.parse({}))).toBe(false);
  });

  it("is true once any non-pagination filter is set", () => {
    expect(hasActiveFilters(JobFiltersSchema.parse({ remote: true }))).toBe(true);
  });

  it("ignores pageNumber/pageSize", () => {
    expect(hasActiveFilters(JobFiltersSchema.parse({ pageNumber: 3, pageSize: 10 }))).toBe(false);
  });
});
