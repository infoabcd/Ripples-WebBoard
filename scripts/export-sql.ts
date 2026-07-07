import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { runMigrations } from "@/server/db/migrate";
import { validateEnv } from "@/lib/env";
import { getDatabaseDialect } from "@/server/db/config";
import { getDb } from "@/server/db/client";
import type { DatabaseAdapter } from "@/server/db/adapter";

/** 依外鍵依賴排序：先父表、後子表 */
const DATA_TABLES = [
  "schema_migrations",
  "users",
  "boards",
  "board_moderators",
  "invite_codes",
  "threads",
  "replies",
  "thread_likes",
  "thread_favorites",
  "notifications",
  "audit_logs",
  "invite_code_uses",
] as const;

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "bigint") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function tableColumns(db: DatabaseAdapter, table: string): Promise<string[]> {
  if (db.dialect === "sqlite") {
    const rows = await db.all<{ name: string }>(`PRAGMA table_info(${table})`);
    return rows.map((row) => row.name);
  }

  const sample = await db.get(`SELECT * FROM ${table} LIMIT 1`);
  if (sample) return Object.keys(sample);

  return [];
}

async function tableRows(db: DatabaseAdapter, table: string): Promise<Record<string, unknown>[]> {
  return db.all(`SELECT * FROM ${table}`);
}

function buildSchemaSql(): string {
  const migrationsDir = path.join(process.cwd(), "src/server/db/migrations");
  const files = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  const parts = [
    "-- Ripples WebBoard schema (from migrations)",
    "-- 建議先執行遷移：npm run dev 啟動一次，或於空庫手動執行本檔",
    "",
  ];

  for (const file of files) {
    parts.push(`-- ${file}`);
    parts.push(readFileSync(path.join(migrationsDir, file), "utf8").trim());
    parts.push("");
  }

  return parts.join("\n");
}

async function buildDataSql(db: DatabaseAdapter): Promise<string> {
  const dialect = db.dialect;
  const lines: string[] = [
    "-- Ripples WebBoard data snapshot",
    `-- Generated: ${new Date().toISOString()}`,
    `-- Dialect source: ${dialect}`,
    "--",
    "-- 匯入前請先建立 schema（見 schema.sql 或啟動應用自動遷移）",
    "-- SQLite:  sqlite3 data/boards.sqlite < scripts/snapshots/dev-data.sql",
    "-- MariaDB: mysql -u USER -p DBNAME < scripts/snapshots/dev-data.sql",
    "",
  ];

  if (dialect === "sqlite") {
    lines.push("PRAGMA foreign_keys = OFF;", "");
  } else {
    lines.push("SET FOREIGN_KEY_CHECKS = 0;", "");
  }

  for (const table of [...DATA_TABLES].reverse()) {
    lines.push(`DELETE FROM ${table};`);
  }
  lines.push("");

  let totalRows = 0;

  for (const table of DATA_TABLES) {
    const columns = await tableColumns(db, table);
    if (columns.length === 0) continue;

    const rows = await tableRows(db, table);
    if (rows.length === 0) continue;

    lines.push(`-- ${table} (${rows.length} rows)`);
    const columnList = columns.map((c) => `"${c}"`).join(", ");

    for (const row of rows) {
      const values = columns.map((col) => sqlLiteral(row[col])).join(", ");
      lines.push(`INSERT INTO ${table} (${columnList}) VALUES (${values});`);
    }

    lines.push("");
    totalRows += rows.length;
  }

  if (dialect === "sqlite") {
    lines.push("PRAGMA foreign_keys = ON;");
  } else {
    lines.push("SET FOREIGN_KEY_CHECKS = 1;");
  }

  lines.push("", `-- Total rows: ${totalRows}`);
  return lines.join("\n");
}

async function main() {
  const withSchema = process.argv.includes("--with-schema");
  const outDir = path.join(process.cwd(), "scripts/snapshots");
  mkdirSync(outDir, { recursive: true });

  await validateEnv();
  await runMigrations();
  const db = getDb();

  try {
    const dataPath = path.join(outDir, "dev-data.sql");
    const dataSql = await buildDataSql(db);
    writeFileSync(dataPath, dataSql, "utf8");
    console.log(`已寫入 ${dataPath}`);

    if (withSchema) {
      const schemaPath = path.join(outDir, "schema.sql");
      writeFileSync(schemaPath, buildSchemaSql(), "utf8");
      console.log(`已寫入 ${schemaPath}`);
    }

    const dialect = getDatabaseDialect();
    if (dialect !== "sqlite") {
      console.log("提示：目前僅從執行中的資料庫匯出；MariaDB/Postgres 語法與 SQLite 相近，匯入前請確認型別相容。");
    }
  } finally {
    await db.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
