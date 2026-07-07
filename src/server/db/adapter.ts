export type DbRow = Record<string, unknown>;

export interface DatabaseAdapter {
  dialect: "sqlite" | "postgres" | "mariadb";
  all<T extends DbRow = DbRow>(sql: string, params?: unknown[]): Promise<T[]>;
  get<T extends DbRow = DbRow>(sql: string, params?: unknown[]): Promise<T | undefined>;
  run(sql: string, params?: unknown[]): Promise<void>;
  exec(sql: string): Promise<void>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export function toBool(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

export function boolParam(value: boolean): number {
  return value ? 1 : 0;
}
