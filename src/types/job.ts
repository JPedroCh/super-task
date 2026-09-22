import type { z } from "zod";
import type { JobSchema, JobListResponseSchema } from "../schemas/job";

export type Job = z.infer<typeof JobSchema>;
export type JobListResponse = z.infer<typeof JobListResponseSchema>;
export type Pagination = JobListResponse["pagination"];

export type Seniority = "EN" | "MI" | "SE" | "EX";
export type EmploymentType = "Full Time" | "Contract" | "Part Time" | "Internship";
