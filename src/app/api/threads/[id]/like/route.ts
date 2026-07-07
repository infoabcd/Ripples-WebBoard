import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { canViewThread } from "@/lib/visibility";
import { toggleLike } from "@/server/services/engagement.service";
import { getThreadById } from "@/server/services/thread.service";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer) {
    return apiError("請先登入", 401);
  }

  const { id } = await context.params;
  const thread = await getThreadById(id);
  if (!thread || !canViewThread(viewer, thread)) {
    return apiError("帖子不存在", 404);
  }

  const result = await toggleLike(viewer.id, thread.id);
  return apiOk(result);
}
