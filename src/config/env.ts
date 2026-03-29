import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const normalizedProcessEnv = {
  ...process.env,
  SHOPIFY_APP_URL: normalizeAppUrl(process.env.SHOPIFY_APP_URL)
};

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

export const env = parseEnv();

function parseEnv() {
  const parsed = envSchema.safeParse(normalizedProcessEnv);
  if (parsed.success) {
    return parsed.data;
  }

  const issues = parsed.error.issues
    .map((issue) => {
      const path = issue.path.join(".");
      const guidance =
        path === "SHOPIFY_APP_URL"
          ? " Use a full URL like https://fb-pixel-capi.pthapp.co.in."
          : "";
      return `${path || "env"}: ${issue.message}.${guidance}`;
    })
    .join("\n");

  throw new Error(`Invalid environment configuration:\n${issues}`);
}

function normalizeAppUrl(value?: string) {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("localhost:") || trimmed.startsWith("127.0.0.1:")) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
}
