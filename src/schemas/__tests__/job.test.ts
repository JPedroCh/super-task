import { describe, it, expect } from "vitest";
import { JobSchema, JobListEnvelopeSchema, JobDetailSchema } from "../job";

function makeJob(overrides: Record<string, unknown> = {}) {
  return {
    id: "e88e2e75-7a8d-4f00-85d9-bd22271b70d8",
    slug: "56997359",
    title: "Staff Content Manager",
    url: "https://example.com/jobs/1",
    applicationUrl: "https://example.com/apply/1",
    company: { name: "Clio", logoUrl: null, websiteUrl: "https://clio.com" },
    location: { city: null, country: null, locality: "Remote - Italy", isRemote: true },
    employmentType: "Full Time",
    seniority: "SE",
    category: null,
    experience: { minYears: null, maxYears: null },
    salary: { min: 62300, max: 93500, currency: "EUR", period: "yearly" },
    skills: [],
    overview: null,
    description: "Some description",
    publishedAt: "2026-09-21T23:37:59.000Z",
    updatedAt: "2026-09-22T00:00:07.112Z",
    ...overrides,
  };
}

describe("JobSchema", () => {
  it("accepts a real-shaped job record", () => {
    expect(JobSchema.safeParse(makeJob()).success).toBe(true);
  });

  it("accepts the documented 0%-populated fields being null (city, country, skills, category)", () => {
    const job = makeJob({
      location: { city: null, country: null, locality: null, isRemote: null },
      category: null,
      skills: null,
      salary: null,
    });
    expect(JobSchema.safeParse(job).success).toBe(true);
  });

  it("rejects a record missing a required field (id)", () => {
    const job = makeJob();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (job as any).id;
    expect(JobSchema.safeParse(job).success).toBe(false);
  });
});

describe("JobListEnvelopeSchema", () => {
  it("validates the { data, pagination } envelope without validating each item strictly", () => {
    const envelope = {
      data: [makeJob(), { garbage: true }],
      pagination: {
        pageNumber: 1,
        pageSize: 20,
        totalItems: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
    const result = JobListEnvelopeSchema.safeParse(envelope);
    expect(result.success).toBe(true);
  });

  it("keeps valid job items and lets malformed ones be dropped by per-item validation", () => {
    const envelope = JobListEnvelopeSchema.parse({
      data: [makeJob(), { garbage: true }, makeJob({ id: "00000000-0000-4000-8000-000000000000" })],
      pagination: {
        pageNumber: 1,
        pageSize: 20,
        totalItems: 3,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    const validated = envelope.data.map((item) => JobSchema.safeParse(item));
    const kept = validated.filter((r) => r.success);
    const dropped = validated.filter((r) => !r.success);

    expect(kept).toHaveLength(2);
    expect(dropped).toHaveLength(1);
  });

  it("rejects a malformed pagination envelope", () => {
    const result = JobListEnvelopeSchema.safeParse({ data: [], pagination: { pageNumber: 1 } });
    expect(result.success).toBe(false);
  });
});

describe("JobDetailSchema", () => {
  it("validates a bare job object with no envelope, matching the real detail endpoint's response shape", () => {
    const result = JobDetailSchema.safeParse(makeJob());
    expect(result.success).toBe(true);
  });
});
