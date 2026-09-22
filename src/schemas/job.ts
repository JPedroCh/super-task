import { z } from "zod";

/**
 * Schema for a single job, matching the real shape of the Athyna public
 * jobs API (verified by direct inspection, not the written brief — several
 * documented fields are 0% populated in the live dataset: city, country,
 * skills, category, overview, experience). Fields are liberally nullable
 * because the API returns explicit `null` rather than omitting keys.
 */
export const JobSchema = z.object({
  id: z.string().uuid(),
  // Nullable like everything else here — confirmed on a real record (an
  // Athyna-posted "Senior Full-Stack Engineer" job, notably one of the very
  // few in the live dataset with `skills` populated) that the API returns
  // `slug: null`. Requiring a string silently dropped that job from every
  // response via the per-item validation in api/jobs.ts — not a hypothetical,
  // an actual real job was invisible in every search because of this.
  slug: z.string().nullable().optional(),
  title: z.string(),
  url: z.string().nullable().optional(),
  applicationUrl: z.string().nullable().optional(),
  company: z.object({
    name: z.string(),
    logoUrl: z.string().nullable().optional(),
    websiteUrl: z.string().nullable().optional(),
  }),
  location: z.object({
    city: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    locality: z.string().nullable().optional(),
    isRemote: z.boolean().nullable().optional(),
  }),
  employmentType: z.string().nullable().optional(),
  seniority: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  experience: z
    .object({
      minYears: z.number().nullable().optional(),
      maxYears: z.number().nullable().optional(),
    })
    .nullable()
    .optional(),
  salary: z
    .object({
      min: z.number().nullable().optional(),
      max: z.number().nullable().optional(),
      currency: z.string().nullable().optional(),
      period: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  skills: z.array(z.string()).nullable().optional(),
  overview: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  publishedAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

const PaginationSchema = z.object({
  pageNumber: z.number(),
  pageSize: z.number(),
  totalItems: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

/** Raw envelope shape before per-item validation is applied. */
export const JobListEnvelopeSchema = z.object({
  data: z.array(z.unknown()),
  pagination: PaginationSchema,
});

/** Fully-validated list response, used for typing only (see api/jobs.ts for
 * the resilient per-item parsing that produces this shape at runtime). */
export const JobListResponseSchema = z.object({
  data: z.array(JobSchema),
  pagination: PaginationSchema,
});

/** The detail endpoint returns a bare job object, no envelope. */
export const JobDetailSchema = JobSchema;
