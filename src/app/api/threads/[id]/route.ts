import { apiError, apiOk } from "@/lib/api";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { validateThreadInput } from "@/lib/validate";
import { canViewThread } from "@/lib/visibility";
import {
  deleteThread,
  getThreadById,
  updatePendingThread,
} from "@/server/services/thread.service";
import { saveThreadImage } from "@/server/storage/image.service";

type PatchThreadPayload = {
  title?: string;
  body?: string;
  imagePath?: string | null;
};

async function parsePatchBody(
  request: Request,
): Promise<PatchThreadPayload | { error: string }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const title = form.has("title") ? String(form.get("title") ?? "").trim() : undefined;
    const body = form.has("body") ? String(form.get("body") ?? "").trim() : undefined;
    let imagePath: string | null | undefined;

    const image = form.get("image");
    const removeImage = form.get("removeImage") === "true";

    if (removeImage) {
      imagePath = null;
    } else if (image instanceof File && image.size > 0) {
      try {
        imagePath = await saveThreadImage(image);
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : "圖片上傳失敗",
        } as const;
      }
    }

    return { title, body, imagePath } as const;
  }

  const body = (await request.json()) as {
    title?: string;
    body?: string;
    removeImage?: boolean;
  };

  return {
    title: body.title?.trim(),
    body: body.body?.trim(),
    imagePath: body.removeImage ? null : undefined,
  } as const;
}

export async function PATCH(
  request: Request,
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

  const parsed = await parsePatchBody(request);
  if ("error" in parsed) {
    return apiError(parsed.error, 400);
  }

  const title = parsed.title ?? thread.title;
  const content = parsed.body ?? thread.body;
  const imagePath = parsed.imagePath === undefined ? thread.imagePath : parsed.imagePath;

  const validationError = validateThreadInput(title, content);
  if (validationError) {
    return apiError(validationError, 400);
  }

  const updated = await updatePendingThread(id, viewer.id, {
    title,
    body: content,
    imagePath,
  });
  if (!updated) {
    return apiError("只能編輯自己的待審主題", 403);
  }

  return apiOk({ thread: updated });
}

export async function DELETE(
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

  const ok = await deleteThread(id, viewer);
  if (!ok) {
    return apiError("只能刪除自己的待審主題，或聯繫管理員", 403);
  }

  return apiOk();
}
