const MAX_TITLE = 120;
const MAX_BODY = 10000;

export function validateThreadInput(title: string, body: string): string | null {
  if (!title || title.length > MAX_TITLE) return "標題長度需在 1–120 字之間";
  if (!body || body.length > MAX_BODY) return "正文長度需在 1–10000 字之間";
  return null;
}

export function validateReplyBody(body: string): string | null {
  if (!body || body.length > MAX_BODY) return "回覆長度需在 1–10000 字之間";
  return null;
}

const SLUG_RE = /^[a-z][a-z0-9_]{1,31}$/;

export function validateEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return "電郵格式不正確";
  }
  return null;
}

export function validateBoardSlug(slug: string): string | null {
  const normalized = slug.trim().toLowerCase();
  if (!SLUG_RE.test(normalized)) {
    return "分區 slug 需為 2–32 位小寫字母、數字或底線，且以字母開頭";
  }
  return null;
}

export function validateBoardInput(
  name: string,
  description: string,
  slug?: string,
): string | null {
  if (slug !== undefined) {
    const slugError = validateBoardSlug(slug);
    if (slugError) return slugError;
  }
  if (!name.trim() || name.trim().length > 40) return "分區名稱需在 1–40 字之間";
  if (description.length > 200) return "分區描述不能超過 200 字";
  return null;
}
