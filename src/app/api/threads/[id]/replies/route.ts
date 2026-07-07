import { apiError, apiNotFound, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { validateReplyBody } from "@/lib/validate";
import { canViewThread } from "@/lib/visibility";
import { createReply } from "@/server/services/reply.service";
import { getThreadById, parseQuoteNo } from "@/server/services/thread.service";
import { saveReplyImage } from "@/server/storage/image.service";

const REPLY_COOLDOWN_MS = 30_000;
const REPLY_LIMIT = 5;

type ReplyPayload = {
  body: string;
  quoteNo: number | null;
  imagePath: string | null;
};

async function parseReplyBody(request: Request): Promise<ReplyPayload | { error: string }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    let imagePath: string | null = null;
    const image = form.get("image");
    if (image instanceof File && image.size > 0) {
      try {
        imagePath = await saveReplyImage(image);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "圖片上傳失敗",
        };
      }
    }

    const quoteRaw = form.get("quoteNo");
    const quoteNo =
      quoteRaw === null || quoteRaw === "" ? null : Number(String(quoteRaw));

    return {
      body: String(form.get("body") ?? "").trim(),
      quoteNo: Number.isFinite(quoteNo) ? quoteNo : null,
      imagePath,
    };
  }

  const body = (await request.json()) as { body?: string; quoteNo?: number | null };
  const content = body.body?.trim() ?? "";

  return {
    body: content,
    quoteNo: body.quoteNo ?? parseQuoteNo(content),
    imagePath: null,
  };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer) {
    return apiError("請先登入", 401);
  }

  if (!checkRateLimit(rateLimitKey(viewer.id, "reply"), REPLY_LIMIT, REPLY_COOLDOWN_MS)) {
    return apiError("回覆過於頻繁，請稍後再試", 429);
  }

  const { id } = await context.params;
  const thread = await getThreadById(id);
  if (!thread || !canViewThread(viewer, thread)) {
    return apiError("帖子不存在", 404);
  }

  const parsed = await parseReplyBody(request);
  if ("error" in parsed) {
    return apiError(parsed.error, 400);
  }

  const validationError = validateReplyBody(parsed.body);
  if (validationError) {
    return apiError(validationError, 400);
  }

  await createReply({
    threadId: thread.id,
    authorId: viewer.id,
    body: parsed.body,
    imagePath: parsed.imagePath,
    quoteNo: parsed.quoteNo,
  });
  return apiOk();
}
