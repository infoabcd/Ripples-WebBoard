import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024;

export function getUploadDir(): string {
  return path.join(process.cwd(), "public", "uploads", "threads");
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "僅支援 JPEG、PNG、GIF、WebP 圖片";
  }
  if (file.size > MAX_BYTES) {
    return "圖片不能超過 4MB";
  }
  if (file.size === 0) {
    return "圖片檔案為空";
  }
  return null;
}

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/gif":
      return ".gif";
    case "image/webp":
      return ".webp";
    default:
      return ".bin";
  }
}

export async function saveThreadImage(file: File): Promise<string> {
  const error = validateImageFile(file);
  if (error) throw new Error(error);

  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}${extFromMime(file.type)}`;
  const absolute = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolute, buffer);

  return `/uploads/threads/${filename}`;
}

/** 回覆配圖與主題共用上傳目錄 */
export const saveReplyImage = saveThreadImage;

export async function deleteThreadImage(imagePath: string | null | undefined): Promise<void> {
  if (!imagePath || !imagePath.startsWith("/uploads/threads/")) return;
  const absolute = path.join(process.cwd(), "public", imagePath);
  try {
    await unlink(absolute);
  } catch {
    /* ignore missing file */
  }
}
