/**
 * Assigns a plan to a user until a payment provider is integrated.
 *   npm run admin:set-plan -- someone@example.com pro
 *
 * Uses DATABASE_URL when set; otherwise the local PGlite database in ./.data
 * (stop `npm run dev` first – PGlite allows only one process at a time).
 */
import path from "node:path";

const PLANS = ["starter", "pro", "business"];

async function main() {
  const [email, plan] = process.argv.slice(2);
  if (!email || !PLANS.includes(plan ?? "")) {
    console.error("Usage: npm run admin:set-plan -- <email> <starter|pro|business>");
    process.exit(1);
  }
  const query = "update users set plan = $1, updated_at = now() where lower(email) = lower($2) returning id";
  let updated = 0;
  const url = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const sql = postgres(url, { max: 1, prepare: false });
    updated = (await sql.unsafe(query, [plan!, email])).length;
    await sql.end();
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const db = new PGlite(process.env.PGLITE_DATA_DIR ?? path.join(process.cwd(), ".data", "pglite"));
    updated = (await db.query(query, [plan, email])).rows.length;
    await db.close();
  }
  if (!updated) {
    console.error(`Kein Nutzer mit E-Mail ${email} gefunden.`);
    process.exit(1);
  }
  console.log(`Plan für ${email} auf "${plan}" gesetzt.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
