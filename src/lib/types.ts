export type UserRole = "member" | "moderator" | "admin";
export type ContentStatus = "pending" | "approved" | "rejected";

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  email: string | null;
  role: UserRole;
  isTrusted: boolean;
  trustedAt: string | null;
  createdAt: string;
};

export type Board = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  createdAt: string;
};

export type Thread = {
  id: string;
  boardId: string;
  authorId: string;
  authorWasTrusted: boolean;
  title: string;
  body: string;
  imagePath: string | null;
  status: ContentStatus;
  rejectReason: string | null;
  createdAt: string;
  approvedAt: string | null;
  viewCount: number;
};

export type Reply = {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  imagePath: string | null;
  quoteNo: number | null;
  status: ContentStatus;
  createdAt: string;
};

export type ThreadLike = {
  userId: string;
  threadId: string;
  createdAt: string;
};

export type ThreadFavorite = {
  userId: string;
  threadId: string;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  isTrusted: boolean;
  /** 版主所轄分區 ID；站長為空陣列表示全站 */
  moderatedBoardIds: string[];
};

export type Viewer = SessionUser | null;

export type VisibilityHint = "public" | "members_pending" | "mods_only" | "author_only";

export type BoardSort = "bump" | "created";

export type NotificationKind =
  | "thread_approved"
  | "thread_rejected"
  | "reply_approved"
  | "reply_rejected"
  | "trusted"
  | "untrusted";

export type Notification = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export type AuditAction =
  | "thread.approve"
  | "thread.reject"
  | "reply.approve"
  | "reply.reject"
  | "user.trust"
  | "user.untrust"
  | "moderator.assign"
  | "moderator.unassign"
  | "board.create"
  | "board.update"
  | "board.delete"
  | "invite.create"
  | "invite.delete"
  | "invite.use"
  | "system.reseed";

export type InviteCodeUse = {
  id: string;
  inviteCodeId: string;
  inviteCode: string;
  userId: string;
  username: string;
  displayName: string;
  usedAt: string;
};

export type InviteCode = {
  id: string;
  code: string;
  note: string | null;
  maxUses: number;
  useCount: number;
  createdAt: string;
  expiresAt: string | null;
  createdBy: string | null;
};

export type AuditLog = {
  id: string;
  actorId: string;
  actorName: string;
  action: AuditAction;
  targetType: string | null;
  targetId: string | null;
  summary: string;
  metadata: string | null;
  createdAt: string;
};
