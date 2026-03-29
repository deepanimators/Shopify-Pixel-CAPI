import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Pool } from "pg";

import { env } from "../config/env.js";

let sharedPool: Pool | null = null;
let schemaReadyPromise: Promise<void> | null = null;

export function getDatabasePool() {
  if (sharedPool) {
    return sharedPool;
  }

  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required when STORAGE_DRIVER=postgres");
  }

  sharedPool = new Pool({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_SSL ? { rejectUnauthorized: false } : undefined
  });

  return sharedPool;
}

export async function closeDatabasePool() {
  if (!sharedPool) {
    return;
  }

  const pool = sharedPool;
  sharedPool = null;
  await pool.end();
}

export async function ensureDatabaseSchema() {
  if (env.STORAGE_DRIVER !== "postgres") {
    return;
  }

  if (schemaReadyPromise) {
    return schemaReadyPromise;
  }

  schemaReadyPromise = bootstrapDatabaseSchema();
  return schemaReadyPromise;
}

async function bootstrapDatabaseSchema() {
  const pool = getDatabasePool();
  const schemaPath = resolve(process.cwd(), "docs", "postgres-schema.sql");
  const schemaSql = readFileSync(schemaPath, "utf8");

  await pool.query(schemaSql);
}
