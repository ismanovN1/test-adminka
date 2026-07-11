import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_DUMMYJSON_BASE_URL: z
    .url()
    .refine((value) => value.startsWith("https://"), {
      message: "DummyJSON base URL must use HTTPS",
    })
    .default("https://dummyjson.com"),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_DUMMYJSON_BASE_URL:
    process.env.NEXT_PUBLIC_DUMMYJSON_BASE_URL ?? undefined,
});
