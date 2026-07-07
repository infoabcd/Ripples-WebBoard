import { randomUUID } from "node:crypto";

import type { DatabaseAdapter } from "@/server/db/adapter";
import { mapAuditLog } from "@/server/db/mappers";
import type { AuditAction, AuditLog } from "@/lib/types";

export class AuditLogRepository {
  constructor(private readonly db: DatabaseAdapter) {}

  async create(input: {
    actorId: string;
    actorName: string;
    action: AuditAction;
    targetType?: string | null;
    targetId?: string | null;
    summary: string;
    metadata?: Record<string, unknown> | null;
  }): Promise<AuditLog> {
    const log: AuditLog = {
      id: randomUUID(),
      actorId: input.actorId,
      actorName: input.actorName,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      summary: input.summary,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      createdAt: new Date().toISOString(),
    };

    await this.db.run(
      `INSERT INTO audit_logs (id, actor_id, actor_name, action, target_type, target_id, summary, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        log.id,
        log.actorId,
        log.actorName,
        log.action,
        log.targetType,
        log.targetId,
        log.summary,
        log.metadata,
        log.createdAt,
      ],
    );

    return log;
  }

  async findRecent(limit = 100, offset = 0, action?: string | null): Promise<AuditLog[]> {
    if (action) {
      const rows = await this.db.all(
        "SELECT * FROM audit_logs WHERE action = ? ORDER BY created_at DESC LIMIT ? OFFSET ?",
        [action, limit, offset],
      );
      return rows.map(mapAuditLog);
    }
    const rows = await this.db.all(
      "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );
    return rows.map(mapAuditLog);
  }

  async countFiltered(action?: string | null): Promise<number> {
    if (action) {
      const row = await this.db.get<{ count: number }>(
        "SELECT COUNT(*) AS count FROM audit_logs WHERE action = ?",
        [action],
      );
      return Number(row?.count ?? 0);
    }
    return this.count();
  }

  async count(): Promise<number> {
    const row = await this.db.get<{ count: number }>("SELECT COUNT(*) AS count FROM audit_logs");
    return Number(row?.count ?? 0);
  }

  async deleteAll(): Promise<void> {
    await this.db.run("DELETE FROM audit_logs");
  }
}
