import { requireEnv } from "@/lib/env";

export type DatabaseDialect = "sqlite" | "postgres" | "mariadb";

export function getDatabaseDialect(): DatabaseDialect {
  const raw = requireEnv("DATABASE_DIALECT").toLowerCase();
  if (raw === "postgres" || raw === "postgresql") return "postgres";
  if (raw === "mariadb" || raw === "mysql") return "mariadb";
  if (raw === "sqlite") return "sqlite";
  throw new Error(`不支援的 DATABASE_DIALECT：${raw}`);
}

export function getDatabaseUrl(): string {
  return requireEnv("DATABASE_URL");
}
