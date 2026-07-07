import type { SessionUser } from "@/lib/types";

/** 僅登入會員可查看他人公開主頁（/u/用戶名） */
export function canViewMemberProfile(viewer: SessionUser | null): boolean {
  return viewer !== null;
}
