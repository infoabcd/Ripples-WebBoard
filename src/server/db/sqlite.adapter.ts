import { mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

import type { DatabaseAdapter, DbRow } from "./adapter";

export class SqliteAdapter implements DatabaseAdapter {
  readonly dialect = "sqlite" as const;
  private readonly db: Database.Database;

  constructor(databasePath: string) {
    const resolved = path.isAbsolute(databasePath)
      ? databasePath
      : path.join(process.cwd(), databasePath);
    mkdirSync(path.dirname(resolved), { recursive: true });
    this.db = new Database(resolved);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
  }

  async all<T extends DbRow = DbRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    return this.db.prepare(sql).all(...params) as T[];
  }

  async get<T extends DbRow = DbRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    this.db.prepare(sql).run(...params);
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const wrapped = this.db.transaction(() => fn());
    return wrapped();
  }

  async close(): Promise<void> {
    this.db.close();
  }
}
