import { apiOk } from "@/lib/api";
import { ensureDatabase } from "@/lib/init";
import { incrementThreadView } from "@/server/services/thread.service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await ensureDatabase();
  const { id } = await context.params;
  await incrementThreadView(id);
  return apiOk({ ok: true });
}
