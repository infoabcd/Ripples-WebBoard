import { randomUUID } from "node:crypto";

import type { DatabaseAdapter } from "@/server/db/adapter";
import { boolParam } from "@/server/db/adapter";
import { mapInviteCode, mapInviteCodeUse } from "@/server/db/mappers";
import type { InviteCode, InviteCodeUse } from "@/lib/types";

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export class InviteCodeRepository {
  constructor(private readonly db: DatabaseAdapter) {}

  async findAll(): Promise<InviteCode[]> {
    const rows = await this.db.all("SELECT * FROM invite_codes ORDER BY created_at DESC");
    return rows.map(mapInviteCode);
  }

  async findByCode(code: string): Promise<InviteCode | null> {
    const row = await this.db.get("SELECT * FROM invite_codes WHERE code = ?", [
      normalizeCode(code),
    ]);
    return row ? mapInviteCode(row) : null;
  }

  async findById(id: string): Promise<InviteCode | null> {
    const row = await this.db.get("SELECT * FROM invite_codes WHERE id = ?", [id]);
    return row ? mapInviteCode(row) : null;
  }

  async create(input: {
    code: string;
    note?: string | null;
    maxUses?: number;
    directTrust?: boolean;
    expiresAt?: string | null;
    createdBy?: string | null;
  }): Promise<InviteCode> {
    const invite: InviteCode = {
      id: randomUUID(),
      code: normalizeCode(input.code),
      note: input.note ?? null,
      maxUses: input.maxUses ?? 0,
      useCount: 0,
      directTrust: input.directTrust ?? false,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt ?? null,
      createdBy: input.createdBy ?? null,
    };

    await this.db.run(
      `INSERT INTO invite_codes (
        id, code, note, max_uses, use_count, direct_trust, created_at, expires_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invite.id,
        invite.code,
        invite.note,
        invite.maxUses,
        invite.useCount,
        boolParam(invite.directTrust),
        invite.createdAt,
        invite.expiresAt,
        invite.createdBy,
      ],
    );

    return invite;
  }

  async recordUse(inviteCodeId: string, userId: string): Promise<void> {
    await this.db.run(
      `INSERT INTO invite_code_uses (id, invite_code_id, user_id, used_at) VALUES (?, ?, ?, ?)`,
      [randomUUID(), inviteCodeId, userId, new Date().toISOString()],
    );
    await this.db.run("UPDATE invite_codes SET use_count = use_count + 1 WHERE id = ?", [
      inviteCodeId,
    ]);
  }

  async listRecentUses(limit = 50, offset = 0): Promise<InviteCodeUse[]> {
    const rows = await this.db.all(
      `SELECT u.id, u.invite_code_id, u.user_id, u.used_at,
              ic.code AS invite_code,
              usr.username, usr.display_name
       FROM invite_code_uses u
       JOIN invite_codes ic ON ic.id = u.invite_code_id
       JOIN users usr ON usr.id = u.user_id
       ORDER BY u.used_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset],
    );
    return rows.map(mapInviteCodeUse);
  }

  async countUsages(): Promise<number> {
    const row = await this.db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM invite_code_uses",
    );
    return Number(row?.count ?? 0);
  }

  async deleteById(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;
    await this.db.run("DELETE FROM invite_code_uses WHERE invite_code_id = ?", [id]);
    await this.db.run("DELETE FROM invite_codes WHERE id = ?", [id]);
    return true;
  }

  async deleteAllUsages(): Promise<void> {
    await this.db.run("DELETE FROM invite_code_uses");
  }

  async deleteAll(): Promise<void> {
    await this.deleteAllUsages();
    await this.db.run("DELETE FROM invite_codes");
  }
}
