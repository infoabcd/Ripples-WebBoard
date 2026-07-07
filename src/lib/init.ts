import { validateEnv } from "@/lib/env";
import { runMigrations } from "@/server/db/migrate";

let initialized = false;

/** 校驗環境變數並執行資料庫遷移 */
export async function ensureDatabase(): Promise<void> {
  if (initialized) return;
  validateEnv();
  await runMigrations();
  initialized = true;
}
