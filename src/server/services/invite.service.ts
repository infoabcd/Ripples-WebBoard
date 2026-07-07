import { randomBytes } from "node:crypto";

import { getRegistrationConfig } from "@/lib/registration";
import type { InviteCode, InviteCodeUse } from "@/lib/types";
import { getRepositories } from "@/server/repositories";

export function generateInviteCode(length = 8): string {
  return randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length)
    .toUpperCase();
}

export function formatInviteMaxUses(maxUses: number): string {
  return maxUses <= 0 ? "不限次數" : `${maxUses} 次`;
}

export async function listInviteCodes(): Promise<InviteCode[]> {
  return getRepositories().inviteCodes.findAll();
}

export async function listInviteCodeUses(limit = 50, offset = 0): Promise<InviteCodeUse[]> {
  return getRepositories().inviteCodes.listRecentUses(limit, offset);
}

export async function createInviteCode(input: {
  code?: string;
  note?: string;
  maxUses?: number;
  createdBy?: string;
}): Promise<InviteCode | { error: string }> {
  const code = (input.code?.trim() || generateInviteCode()).toUpperCase();
  if (!/^[A-Z0-9_-]{4,32}$/.test(code)) {
    return { error: "邀請碼須為 4–32 位字母、數字、底線或連字元" };
  }

  const existing = await getRepositories().inviteCodes.findByCode(code);
  if (existing) return { error: "該邀請碼已存在" };

  return getRepositories().inviteCodes.create({
    code,
    note: input.note ?? null,
    maxUses: input.maxUses ?? 0,
    createdBy: input.createdBy ?? null,
  });
}

export async function deleteInviteCode(id: string): Promise<boolean> {
  return getRepositories().inviteCodes.deleteById(id);
}

export type ValidateInviteResult =
  | { ok: true; invite: InviteCode | null }
  | { ok: false; error: string };

export async function validateInviteCode(rawCode: string): Promise<ValidateInviteResult> {
  const config = getRegistrationConfig();
  if (!config.inviteRequired) return { ok: true, invite: null };

  const code = rawCode.trim();
  if (!code) return { ok: false, error: "請輸入邀請碼" };

  const invite = await getRepositories().inviteCodes.findByCode(code);
  if (!invite) return { ok: false, error: "邀請碼無效" };
  if (invite.expiresAt && invite.expiresAt < new Date().toISOString()) {
    return { ok: false, error: "邀請碼已過期" };
  }
  if (invite.maxUses > 0 && invite.useCount >= invite.maxUses) {
    return { ok: false, error: "邀請碼已達使用上限" };
  }

  return { ok: true, invite };
}

export async function recordInviteRegistration(input: {
  invite: InviteCode;
  user: { id: string; username: string; displayName: string };
}): Promise<void> {
  await getRepositories().inviteCodes.recordUse(input.invite.id, input.user.id);
  await getRepositories().auditLogs.create({
    actorId: input.user.id,
    actorName: input.user.displayName,
    action: "invite.use",
    targetType: "user",
    targetId: input.user.id,
    summary: `${input.user.displayName} (@${input.user.username}) 使用邀請碼 ${input.invite.code} 註冊`,
    metadata: { inviteCodeId: input.invite.id, inviteCode: input.invite.code },
  });
}
