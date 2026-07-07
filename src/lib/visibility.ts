import type { ContentStatus, Thread, Viewer, VisibilityHint } from "./types";
import { isBoardModerator } from "./permissions";

export function getThreadVisibilityHint(thread: Thread): VisibilityHint {
  if (thread.status === "approved") return "public";
  if (thread.status === "rejected") return "author_only";
  if (thread.authorWasTrusted) return "members_pending";
  return "mods_only";
}

export function canViewThread(viewer: Viewer, thread: Thread): boolean {
  if (thread.status === "approved") return true;

  if (viewer?.id === thread.authorId) return true;
  if (isBoardModerator(viewer, thread.boardId)) return true;

  if (thread.status === "rejected") return false;

  // pending
  if (thread.authorWasTrusted && viewer) return true;
  return false;
}

export function canViewReply(
  viewer: Viewer,
  thread: Thread,
  replyStatus: ContentStatus,
): boolean {
  if (!canViewThread(viewer, thread)) return false;
  if (replyStatus === "approved") return true;
  if (replyStatus === "rejected") {
    return isBoardModerator(viewer, thread.boardId);
  }
  // pending reply inherits thread visibility (scheme A)
  return true;
}

export function visibilityLabel(hint: VisibilityHint): string {
  switch (hint) {
    case "public":
      return "";
    case "members_pending":
      return "待審核 · 僅社群成員可見";
    case "mods_only":
      return "審核中 · 僅站務可見";
    case "author_only":
      return "已駁回";
  }
}

export function statusLabel(status: ContentStatus): string {
  switch (status) {
    case "pending":
      return "待審核";
    case "approved":
      return "已通過";
    case "rejected":
      return "已駁回";
  }
}
