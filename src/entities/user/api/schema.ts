import { z } from "zod";

const userDtoSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.email(),
  phone: z.string().default(""),
  image: z.string().default(""),
  role: z.string().default(""),
  company: z
    .object({
      name: z.string().default(""),
      department: z.string().default(""),
    })
    .default({ name: "", department: "" }),
  address: z
    .object({
      country: z.string().default(""),
    })
    .default({ country: "" }),
});

export const usersResponseSchema = z.object({
  users: z.array(userDtoSchema),
  total: z.number().int().nonnegative(),
  skip: z.number().int().nonnegative(),
  limit: z.number().int().nonnegative(),
});

export type UserDto = z.infer<typeof userDtoSchema>;
export type UsersResponseDto = z.infer<typeof usersResponseSchema>;
