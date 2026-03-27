import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  META_PIXEL_ID: z.string().optional(),
  META_ACCESS_TOKEN: z.string().optional()
});

export const env = envSchema.parse(process.env);
