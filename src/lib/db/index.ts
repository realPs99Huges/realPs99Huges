import "server-only";
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

type GlobalDb = { __postpilotDb?: Promise<Database> };
const globalForDb = globalThis as unknown as GlobalDb;

export class DatabaseConfigError extends Error {}

async function createDatabase(): Promise<Database> {
  // DATABASE_URL takes precedence; NETLIFY_DATABASE_URL is provided automatically by Netlify DB.
  const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;

  if (url) {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    // prepare:false keeps the client compatible with transaction poolers (Supabase, Neon).
    const client = postgres(url, { max: 5, prepare: false, idle_timeout: 20 });
    return drizzle(client, { schema }) as unknown as Database;
  }

  if (process.env.NODE_ENV === "production" && process.env.POSTPILOT_ALLOW_LOCAL_DB !== "true") {
    throw new DatabaseConfigError(
      "DATABASE_URL ist nicht gesetzt. In Produktion wird eine PostgreSQL-Datenbank benötigt.",
    );
  }

  // Local development: embedded Postgres (PGlite) persisted to ./.data, migrated automatically.
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dataDir = process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), ".data", "pglite");
  const { mkdirSync } = await import("node:fs");
  mkdirSync(dataDir, { recursive: true });
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
  return db as unknown as Database;
}

export function getDb(): Promise<Database> {
  if (!globalForDb.__postpilotDb) {
    globalForDb.__postpilotDb = createDatabase().catch((error) => {
      globalForDb.__postpilotDb = undefined;
      throw error;
    });
  }
  return globalForDb.__postpilotDb;
}

export { schema };
