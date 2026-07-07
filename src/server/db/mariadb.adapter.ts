import mysql from "mysql2/promise";

import type { DatabaseAdapter, DbRow } from "./adapter";

export class MariadbAdapter implements DatabaseAdapter {
  readonly dialect = "mariadb" as const;
  private readonly pool: mysql.Pool;

  constructor(connectionString: string) {
    this.pool = mysql.createPool(connectionString);
  }

  async all<T extends DbRow = DbRow>(sql: string, params: unknown[] = []): Promise<T[]> {
    const [rows] = await this.pool.query(sql, params);
    return rows as T[];
  }

  async get<T extends DbRow = DbRow>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    const [rows] = await this.pool.query(sql, params);
    const list = rows as T[];
    return list[0];
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    await this.pool.query(sql, params);
  }

  async exec(sql: string): Promise<void> {
    await this.pool.query(sql);
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await fn();
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
