import type { z } from "zod";
import type { JobFiltersSchema } from "../schemas/filters";

export type JobFilters = z.infer<typeof JobFiltersSchema>;
export type SortBy = NonNullable<JobFilters["sortBy"]>;
export type SortOrder = NonNullable<JobFilters["sortOrder"]>;
