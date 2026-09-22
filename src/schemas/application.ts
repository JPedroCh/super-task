import { z } from "zod";

export const ApplicationSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  resumeFileName: z.string().trim().min(1, "Attach a resume"),
  message: z.string().trim().max(2000).optional(),
});

export type ApplicationFormValues = z.infer<typeof ApplicationSchema>;
