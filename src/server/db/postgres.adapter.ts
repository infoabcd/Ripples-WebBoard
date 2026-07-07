import { Pool } from "pg";

import type { DatabaseAdapter, DbRow } from "./adapter";

function toPgSql(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export class PostgresAdapter implements DatabaseAdapter {
  readonly dialect = "postgres" as const;
  private readonly pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  async all<T extends DbRow = DbRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.pool.query<T>(toPgSql(sql), params);
    return result.rows;
  }

  async get<T extends DbRow = DbRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    const result = await this.pool.query<T>(toPgSql(sql), params);
    return result.rows[0];
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    await this.pool.query(toPgSql(sql), params);
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn();
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
