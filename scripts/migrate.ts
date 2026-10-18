/**
 * Applies pending SQL migrations from ./drizzle to the database in DATABASE_URL.
 * Local development without DATABASE_URL migrates the embedded PGlite database automatically on start.
 */
import path from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

async function main() {
  // Prefer a direct (unpooled) connection for DDL when the provider offers one.
  const url =
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
    process.env.DATABASE_URL ||
    process.env.NETLIFY_DATABASE_URL;
  if (!url) {
    if (process.env.NETLIFY === "true" || process.env.CI === "true") {
      console.error("DATABASE_URL (oder NETLIFY_DATABASE_URL) fehlt – Migration kann nicht ausgeführt werden.");
      process.exit(1);
    }
    console.log("DATABASE_URL nicht gesetzt – lokale PGlite-Datenbank wird beim Start automatisch migriert.");
    return;
  }
  const client = postgres(url, { max: 1, prepare: false });
  await migrate(drizzle(client), { migrationsFolder: path.join(process.cwd(), "drizzle") });
  await client.end();
  console.log("Migrationen angewendet.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
