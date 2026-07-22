import { toBool } from "./adapter";
import type { AuditAction, AuditLog, Board, ContentStatus, InviteCode, InviteCodeUse, Notification, NotificationKind, Reply, Thread, ThreadFavorite, ThreadLike, User } from "@/lib/types";

function asStatus(value: unknown): ContentStatus {
  if (value === "approved" || value === "approve") return "approved";
  if (value === "rejected" || value === "reject") return "rejected";
  return "pending";
}

export function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    username: String(row.username),
    passwordHash: String(row.password_hash),
    displayName: String(row.display_name),
    email: row.email ? String(row.email) : null,
    role: row.role === "admin" ? "admin" : row.role === "moderator" ? "moderator" : "member",
    isTrusted: toBool(row.is_trusted),
    trustedAt: row.trusted_at ? String(row.trusted_at) : null,
    createdAt: String(row.created_at),
  };
}

export function mapBoard(row: Record<string, unknown>): Board {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description),
    sortOrder: Number(row.sort_order),
    createdAt: String(row.created_at),
  };
}

export function mapThread(row: Record<string, unknown>): Thread {
  return {
    id: String(row.id),
    boardId: String(row.board_id),
    authorId: String(row.author_id),
    authorWasTrusted: toBool(row.author_was_trusted),
    title: String(row.title),
    body: String(row.body),
    imagePath: row.image_path ? String(row.image_path) : null,
    status: asStatus(row.status),
    rejectReason: row.reject_reason ? String(row.reject_reason) : null,
    createdAt: String(row.created_at),
    approvedAt: row.approved_at ? String(row.approved_at) : null,
    viewCount: Number(row.view_count ?? 0),
  };
}

export function mapReply(row: Record<string, unknown>): Reply {
  return {
    id: String(row.id),
    threadId: String(row.thread_id),
    authorId: String(row.author_id),
    body: String(row.body),
    imagePath: row.image_path ? String(row.image_path) : null,
    quoteNo: row.quote_no === null || row.quote_no === undefined ? null : Number(row.quote_no),
    status: asStatus(row.status),
    createdAt: String(row.created_at),
  };
}

export function mapLike(row: Record<string, unknown>): ThreadLike {
  return {
    userId: String(row.user_id),
    threadId: String(row.thread_id),
    createdAt: String(row.created_at),
  };
}

export function mapFavorite(row: Record<string, unknown>): ThreadFavorite {
  return {
    userId: String(row.user_id),
    threadId: String(row.thread_id),
    createdAt: String(row.created_at),
  };
}

export function mapNotification(row: Record<string, unknown>): Notification {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    kind: String(row.kind) as NotificationKind,
    title: String(row.title),
    body: String(row.body),
    link: row.link ? String(row.link) : null,
    readAt: row.read_at ? String(row.read_at) : null,
    createdAt: String(row.created_at),
  };
}

export function mapAuditLog(row: Record<string, unknown>): AuditLog {
  return {
    id: String(row.id),
    actorId: String(row.actor_id),
    actorName: String(row.actor_name),
    action: String(row.action) as AuditAction,
    targetType: row.target_type ? String(row.target_type) : null,
    targetId: row.target_id ? String(row.target_id) : null,
    summary: String(row.summary),
    metadata: row.metadata ? String(row.metadata) : null,
    createdAt: String(row.created_at),
  };
}

export function mapInviteCode(row: Record<string, unknown>): InviteCode {
  return {
    id: String(row.id),
    code: String(row.code),
    note: row.note ? String(row.note) : null,
    maxUses: Number(row.max_uses ?? 0),
    useCount: Number(row.use_count ?? 0),
    directTrust: toBool(row.direct_trust),
    createdAt: String(row.created_at),
    expiresAt: row.expires_at ? String(row.expires_at) : null,
    createdBy: row.created_by ? String(row.created_by) : null,
  };
}

export function mapInviteCodeUse(row: Record<string, unknown>): InviteCodeUse {
  return {
    id: String(row.id),
    inviteCodeId: String(row.invite_code_id),
    inviteCode: String(row.invite_code),
    userId: String(row.user_id),
    username: String(row.username),
    displayName: String(row.display_name),
    usedAt: String(row.used_at),
  };
}
