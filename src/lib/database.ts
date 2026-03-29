import { Pool } from "pg";

import { env } from "../config/env.js";

let sharedPool: Pool | null = null;

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
