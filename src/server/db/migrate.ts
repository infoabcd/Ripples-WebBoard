import { readFileSync } from "node:fs";
import path from "node:path";

import { getDb } from "./client";

const MIGRATIONS_DIR = path.join(process.cwd(), "src/server/db/migrations");

export async function runMigrations(): Promise<void> {
  const db = getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  for (const file of [
    "001_init.sql",
    "002_board_moderators.sql",
    "003_reply_image.sql",
    "004_notifications_audit.sql",
    "005_invite_codes.sql",
    "006_invite_code_uses.sql",
  ]) {
    const version = file.replace(".sql", "");
    const applied = await db.get("SELECT version FROM schema_migrations WHERE version = ?", [version]);
    if (applied) continue;

    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    const statements = sql
      .split(";")
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    for (const statement of statements) {
      if (statement.includes("schema_migrations")) continue;
      await db.run(statement);
    }

    await db.run("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)", [
      version,
      new Date().toISOString(),
    ]);
  }
}
