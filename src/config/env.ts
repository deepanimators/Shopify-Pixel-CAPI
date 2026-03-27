import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  SHOPIFY_API_KEY: z.string().optional(),
  SHOPIFY_API_SECRET: z.string().optional(),
  SHOPIFY_APP_URL: z.string().url().default("http://localhost:3000"),
  SHOPIFY_SCOPES: z
    .string()
    .default(
      "read_orders,read_customers,read_markets,write_pixels,read_customer_events,write_app_proxy"
    ),
  META_GRAPH_API_VERSION: z.string().default("v22.0"),
  DEFAULT_META_PIXEL_ID: z.string().optional(),
  DEFAULT_META_ACCESS_TOKEN: z.string().optional()
});

export const env = envSchema.parse(process.env);
