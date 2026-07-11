import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().trim().min(2, "firstName"),
  lastName: z.string().trim().min(2, "lastName"),
  email: z.email("email"),
  role: z.string().trim().min(2, "role"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

