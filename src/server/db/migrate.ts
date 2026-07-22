import { readFileSync } from "node:fs";
import path from "node:path";

import { getDb } from "./client";

const MIGRATIONS_DIR = path.join(process.cwd(), "src/server/db/migrations");

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
}

function isDuplicateColumnError(error: unknown): boolean {
  const message = errorMessage(error);
  return message.includes("duplicate column") || message.includes("already exists");
}

function isDuplicateMigrationError(error: unknown): boolean {
  const message = errorMessage(error);
  return (
    message.includes("unique constraint") ||
    message.includes("duplicate key") ||
    message.includes("duplicate entry")
  );
}

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
    "007_invite_direct_trust.sql",
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
      try {
        await db.run(statement);
      } catch (error) {
        if (!isDuplicateColumnError(error)) throw error;
      }
    }

    const latestApplied = await db.get("SELECT version FROM schema_migrations WHERE version = ?", [version]);
    if (latestApplied) continue;

    try {
      await db.run("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)", [
        version,
        new Date().toISOString(),
      ]);
    } catch (error) {
      if (!isDuplicateMigrationError(error)) throw error;
    }
  }
}
