import { describe, it, expect } from "vitest";
import { extractTitleKeyword, buildSimilarJobsFilters, buildContextualFilterChips } from "../similarJobs";
import type { Job } from "../../types/job";

function makeJob(overrides: Partial<Job> = {}): Job {
  return {
    id: "e88e2e75-7a8d-4f00-85d9-bd22271b70d8",
    slug: "56997359",
    title: "Senior React Developer",
    url: null,
    applicationUrl: null,
    company: { name: "Acme", logoUrl: null, websiteUrl: null },
    location: { city: null, country: null, locality: "São Paulo, Brazil", isRemote: true },
    employmentType: "Full Time",
    seniority: "SE",
    category: null,
    experience: null,
    salary: null,
    skills: ["React", "TypeScript", "Node.js"],
    overview: null,
    description: null,
    publishedAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe("extractTitleKeyword", () => {
  it("drops a single leading seniority word and keeps the rest as a contiguous phrase", () => {
    expect(extractTitleKeyword("Senior React Developer")).toBe("React Developer");
  });

  it("drops a leading noise word like 'Staff'", () => {
    expect(extractTitleKeyword("Staff Content Manager")).toBe("Content Manager");
  });

  it("leaves a title with no leading noise word untouched (capped to 3 words)", () => {
    expect(extractTitleKeyword("Backend Engineer")).toBe("Backend Engineer");
  });

  it("never strips the only word in a title", () => {
    expect(extractTitleKeyword("Engineer")).toBe("Engineer");
  });

  it("caps the keyword to 3 words", () => {
    expect(extractTitleKeyword("Senior Full Stack Platform Engineer II")).toBe("Full Stack Platform");
  });
});

describe("buildSimilarJobsFilters", () => {
  it("includes seniority, employment type, remote, skills and a title keyword", () => {
    const filters = buildSimilarJobsFilters(makeJob());
    expect(filters.seniority).toBe("SE");
    expect(filters.employmentType).toBe("Full Time");
    expect(filters.remote).toBe(true);
    expect(filters.skills).toEqual(["React", "TypeScript", "Node.js"]);
    expect(filters.q).toBe("React Developer");
  });

  it("caps skills to 3 even when the job has more", () => {
    const job = makeJob({ skills: ["A", "B", "C", "D", "E"] });
    expect(buildSimilarJobsFilters(job).skills).toEqual(["A", "B", "C"]);
  });

  it("omits remote when the job isn't remote — never sends remote:false", () => {
    const job = makeJob({ location: { city: null, country: null, locality: null, isRemote: false } });
    expect(buildSimilarJobsFilters(job).remote).toBeUndefined();
  });

  it("omits fields the job doesn't have rather than sending empty/null values", () => {
    const job = makeJob({ seniority: null, employmentType: null, skills: null });
    const filters = buildSimilarJobsFilters(job);
    expect(filters.seniority).toBeUndefined();
    expect(filters.employmentType).toBeUndefined();
    expect(filters.skills).toBeUndefined();
  });
});

describe("buildContextualFilterChips", () => {
  it("builds one chip per field the job actually has", () => {
    const chips = buildContextualFilterChips(makeJob(), "Senior");
    const labels = chips.map((c) => c.label);
    expect(labels).toContain("Senior");
    expect(labels).toContain("Full Time");
    expect(labels).toContain("Remote");
    expect(labels).toContain("React");
    expect(labels).toContain("TypeScript");
    expect(labels).toContain("Node.js");
  });

  it("produces no city/country chips when those fields are unpopulated (the common case in this dataset)", () => {
    const chips = buildContextualFilterChips(makeJob(), "Senior");
    expect(chips.some((c) => "city" in c.filters)).toBe(false);
    expect(chips.some((c) => "country" in c.filters)).toBe(false);
  });

  it("returns an empty list for a job with none of the chip-eligible fields", () => {
    const job = makeJob({
      seniority: null,
      employmentType: null,
      location: { city: null, country: null, locality: null, isRemote: null },
      skills: null,
    });
    expect(buildContextualFilterChips(job, null)).toEqual([]);
  });
});
