import { apiOk } from "@/lib/api";
import { ensureDatabase } from "@/lib/init";
import { getDatabaseDialect } from "@/server/db/config";
import { isEmailConfigured } from "@/server/services/email.service";

export async function GET() {
  await ensureDatabase();
  return apiOk({
    status: "ok",
    dialect: getDatabaseDialect(),
    email: isEmailConfigured(),
    time: new Date().toISOString(),
  });
}
