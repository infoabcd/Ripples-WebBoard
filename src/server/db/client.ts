import { getDatabaseDialect, getDatabaseUrl } from "./config";
import type { DatabaseAdapter } from "./adapter";
import { MariadbAdapter } from "./mariadb.adapter";
import { PostgresAdapter } from "./postgres.adapter";
import { SqliteAdapter } from "./sqlite.adapter";

let adapter: DatabaseAdapter | null = null;

export function getDb(): DatabaseAdapter {
  if (adapter) return adapter;

  const dialect = getDatabaseDialect();
  const url = getDatabaseUrl();

  switch (dialect) {
    case "postgres":
      adapter = new PostgresAdapter(url);
      break;
    case "mariadb":
      adapter = new MariadbAdapter(url);
      break;
    default:
      adapter = new SqliteAdapter(url);
  }

  return adapter;
}

export async function closeDb(): Promise<void> {
  if (adapter) {
    await adapter.close();
    adapter = null;
  }
}
