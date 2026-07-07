import type { AuditAction, NotificationKind, SessionUser } from "@/lib/types";
import { getRepositories } from "@/server/repositories";
import { getSmtpConfig, sendEmail } from "@/server/services/email.service";
import { getUserById } from "@/server/services/user.service";

export async function recordAudit(input: {
  actor: SessionUser;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await getRepositories().auditLogs.create({
    actorId: input.actor.id,
    actorName: input.actor.displayName,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    summary: input.summary,
    metadata: input.metadata,
  });
}

export async function listAuditLogs(limit = 100, offset = 0) {
  return getRepositories().auditLogs.findRecent(limit, offset);
}

export async function countAuditLogs(): Promise<number> {
  return getRepositories().auditLogs.count();
}

export async function notifyUser(input: {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link?: string;
  emailSubject?: string;
  emailText?: string;
}): Promise<void> {
  await getRepositories().notifications.create({
    userId: input.userId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    link: input.link,
  });

  const user = await getUserById(input.userId);
  if (!user?.email) return;

  const config = getSmtpConfig();
  const link = input.link ? `${config.siteUrl}${input.link}` : config.siteUrl;
  const subject = input.emailSubject ?? input.title;
  const text =
    input.emailText ??
    `${input.body}\n\n查看：${link}\n\n— Ripples WebBoard`;

  try {
    await sendEmail({ to: user.email, subject, text });
  } catch (error) {
    console.error("[email] failed to send notification:", error);
  }
}

export async function listUserNotifications(userId: string) {
  return getRepositories().notifications.findByUserId(userId);
}

export async function countUnreadNotifications(userId: string): Promise<number> {
  return getRepositories().notifications.countUnread(userId);
}

export async function markNotificationRead(
  userId: string,
  notificationId: string,
): Promise<boolean> {
  return getRepositories().notifications.markRead(userId, notificationId);
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await getRepositories().notifications.markAllRead(userId);
}

export async function notifyThreadModeration(input: {
  threadId: string;
  authorId: string;
  title: string;
  approved: boolean;
  rejectReason?: string;
}): Promise<void> {
  const link = `/threads/${input.threadId}`;
  if (input.approved) {
    await notifyUser({
      userId: input.authorId,
      kind: "thread_approved",
      title: "主題已通過審核",
      body: `你的主題「${input.title}」已通過審核，現已公開可見。`,
      link,
      emailSubject: `[Ripples] 主題已通過：${input.title}`,
      emailText: `你的主題「${input.title}」已通過審核。\n\n${getSmtpConfig().siteUrl}${link}`,
    });
    return;
  }

  const reason = input.rejectReason?.trim() || "未說明原因";
  await notifyUser({
    userId: input.authorId,
    kind: "thread_rejected",
    title: "主題未通過審核",
    body: `你的主題「${input.title}」被駁回。原因：${reason}`,
    link,
    emailSubject: `[Ripples] 主題被駁回：${input.title}`,
    emailText: `你的主題「${input.title}」未通過審核。\n駁回原因：${reason}\n\n${getSmtpConfig().siteUrl}${link}`,
  });
}

export async function notifyReplyModeration(input: {
  replyId: string;
  threadId: string;
  authorId: string;
  approved: boolean;
  excerpt: string;
}): Promise<void> {
  const link = `/threads/${input.threadId}#p${input.replyId}`;
  const threadLink = `/threads/${input.threadId}`;
  if (input.approved) {
    await notifyUser({
      userId: input.authorId,
      kind: "reply_approved",
      title: "回覆已通過審核",
      body: `你在主題中的回覆已通過審核：${input.excerpt}`,
      link: threadLink,
      emailSubject: "[Ripples] 回覆已通過審核",
      emailText: `你的回覆已通過審核：${input.excerpt}\n\n${getSmtpConfig().siteUrl}${threadLink}`,
    });
    return;
  }

  await notifyUser({
    userId: input.authorId,
    kind: "reply_rejected",
    title: "回覆未通過審核",
    body: `你的回覆未通過審核：${input.excerpt}`,
    link: threadLink,
    emailSubject: "[Ripples] 回覆未通過審核",
    emailText: `你的回覆未通過審核：${input.excerpt}\n\n${getSmtpConfig().siteUrl}${threadLink}`,
  });
}

export async function notifyTrustChange(input: {
  userId: string;
  isTrusted: boolean;
}): Promise<void> {
  if (input.isTrusted) {
    await notifyUser({
      userId: input.userId,
      kind: "trusted",
      title: "你已成為受信會員",
      body: "站長已將你的帳號設為受信。你發布的待審內容將對註冊會員可見。",
      link: "/me",
      emailSubject: "[Ripples] 你已成為受信會員",
    });
    return;
  }

  await notifyUser({
    userId: input.userId,
    kind: "untrusted",
    title: "受信狀態已撤銷",
    body: "你的受信狀態已被撤銷。此後發布的待審內容僅管理員可見。",
    link: "/me",
    emailSubject: "[Ripples] 受信狀態已撤銷",
  });
}
