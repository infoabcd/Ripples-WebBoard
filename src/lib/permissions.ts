import type { SessionUser, Viewer } from "@/lib/types";

export function isSiteAdmin(viewer: Viewer): boolean {
  return viewer?.role === "admin";
}

export function isBoardModerator(viewer: Viewer, boardId: string): boolean {
  if (!viewer) return false;
  if (viewer.role === "admin") return true;
  if (viewer.role === "moderator") return viewer.moderatedBoardIds.includes(boardId);
  return false;
}

export function canAccessAdmin(viewer: Viewer): viewer is SessionUser {
  if (!viewer) return false;
  if (viewer.role === "admin") return true;
  if (viewer.role === "moderator" && viewer.moderatedBoardIds.length > 0) return true;
  return false;
}

export function canManageUsers(viewer: Viewer): boolean {
  return viewer?.role === "admin";
}

export function canModerateThread(viewer: Viewer, boardId: string): boolean {
  return isBoardModerator(viewer, boardId);
}

export function scopedBoardIds(viewer: SessionUser): string[] | null {
  if (viewer.role === "admin") return null;
  return viewer.moderatedBoardIds;
}

export function threadInScope(boardId: string, scope: string[] | null): boolean {
  if (!scope) return true;
  return scope.includes(boardId);
}
