import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { validateThreadInput } from "@/lib/validate";
import { getBoardBySlug } from "@/server/services/board.service";
import { createThread } from "@/server/services/thread.service";
import { getUserById } from "@/server/services/user.service";
import { saveThreadImage } from "@/server/storage/image.service";

const THREAD_COOLDOWN_MS = 60_000;
const THREAD_LIMIT = 3;

type CreateThreadPayload = {
  boardSlug: string;
  title: string;
  body: string;
  imagePath: string | null;
};

async function parseCreateThreadBody(
  request: Request,
): Promise<CreateThreadPayload | { error: string }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    let imagePath: string | null = null;
    const image = form.get("image");
    if (image instanceof File && image.size > 0) {
      try {
        imagePath = await saveThreadImage(image);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "圖片上傳失敗",
        } as const;
      }
    }

    return {
      boardSlug: String(form.get("boardSlug") ?? ""),
      title: String(form.get("title") ?? "").trim(),
      body: String(form.get("body") ?? "").trim(),
      imagePath,
    } as const;
  }

  const body = (await request.json()) as {
    boardSlug?: string;
    title?: string;
    body?: string;
  };

  return {
    boardSlug: body.boardSlug ?? "",
    title: body.title?.trim() ?? "",
    body: body.body?.trim() ?? "",
    imagePath: null,
  } as const;
}

export async function POST(request: Request) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer) {
    return apiError("請先登入", 401);
  }

  if (!checkRateLimit(rateLimitKey(viewer.id, "thread"), THREAD_LIMIT, THREAD_COOLDOWN_MS)) {
    return apiError("發帖過於頻繁，請稍後再試", 429);
  }

  const parsed = await parseCreateThreadBody(request);
  if ("error" in parsed) {
    return apiError(parsed.error, 400);
  }

  const board = parsed.boardSlug ? await getBoardBySlug(parsed.boardSlug) : null;
  if (!board) {
    return apiError("請填寫完整內容", 400);
  }

  const validationError = validateThreadInput(parsed.title, parsed.body);
  if (validationError) {
    return apiError(validationError, 400);
  }

  const author = await getUserById(viewer.id);
  if (!author) {
    return apiError("用戶不存在", 400);
  }

  const thread = await createThread({
    boardId: board.id,
    authorId: author.id,
    authorWasTrusted: author.isTrusted,
    title: parsed.title,
    body: parsed.body,
    imagePath: parsed.imagePath,
  });

  return apiOk({ threadId: thread.id });
}
