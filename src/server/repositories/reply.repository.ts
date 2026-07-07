import { randomUUID } from "node:crypto";

import type { DatabaseAdapter } from "@/server/db/adapter";
import { mapReply } from "@/server/db/mappers";
import type { ContentStatus, Reply } from "@/lib/types";

export class ReplyRepository {
  constructor(private readonly db: DatabaseAdapter) {}

  async findAll(): Promise<Reply[]> {
    const rows = await this.db.all("SELECT * FROM replies ORDER BY created_at ASC");
    return rows.map(mapReply);
  }

  async findById(id: string): Promise<Reply | null> {
    const row = await this.db.get("SELECT * FROM replies WHERE id = ?", [id]);
    return row ? mapReply(row) : null;
  }

  async findByThreadId(threadId: string): Promise<Reply[]> {
    const rows = await this.db.all(
      "SELECT * FROM replies WHERE thread_id = ? ORDER BY created_at ASC",
      [threadId],
    );
    return rows.map(mapReply);
  }

  async countByThreadId(threadId: string): Promise<number> {
    const row = await this.db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM replies WHERE thread_id = ?",
      [threadId],
    );
    return Number(row?.count ?? 0);
  }

  async countByThreadIds(threadIds: string[]): Promise<Record<string, number>> {
    if (threadIds.length === 0) return {};
    const placeholders = threadIds.map(() => "?").join(",");
    const rows = await this.db.all<{ thread_id: string; count: number }>(
      `SELECT thread_id, COUNT(*) AS count FROM replies WHERE thread_id IN (${placeholders}) GROUP BY thread_id`,
      threadIds,
    );
    const map: Record<string, number> = {};
    for (const row of rows) {
      map[String(row.thread_id)] = Number(row.count);
    }
    return map;
  }

  async findPending(): Promise<Reply[]> {
    const rows = await this.db.all(
      "SELECT * FROM replies WHERE status = 'pending' ORDER BY created_at ASC",
    );
    return rows.map(mapReply);
  }

  private buildScopeSql(boardIds?: string[] | null): {
    join: string;
    where: string;
    params: unknown[];
  } {
    if (boardIds && boardIds.length === 0) {
      return { join: "", where: "WHERE 1 = 0", params: [] };
    }
    if (!boardIds) {
      return { join: "", where: "", params: [] };
    }
    return {
      join: "JOIN threads t ON t.id = r.thread_id",
      where: `WHERE t.board_id IN (${boardIds.map(() => "?").join(",")})`,
      params: [...boardIds],
    };
  }

  async countFiltered(filters: {
    boardIds?: string[] | null;
    status?: ContentStatus | null;
  }): Promise<number> {
    const scope = this.buildScopeSql(filters.boardIds);
    const clauses: string[] = [];
    const params = [...scope.params];
    if (scope.where) {
      clauses.push(scope.where.replace(/^WHERE\s+/, ""));
    }
    if (filters.status) {
      clauses.push("r.status = ?");
      params.push(filters.status);
    }
    const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
    const row = await this.db.get<{ count: number }>(
      `SELECT COUNT(*) AS count FROM replies r ${scope.join} ${where}`,
      params,
    );
    return Number(row?.count ?? 0);
  }

  async findPage(
    filters: {
      boardIds?: string[] | null;
      status?: ContentStatus | null;
    },
    limit: number,
    offset: number,
  ): Promise<Reply[]> {
    const scope = this.buildScopeSql(filters.boardIds);
    const params = [...scope.params];
    let where = scope.where;
    if (filters.status) {
      where = where ? `${where} AND r.status = ?` : "WHERE r.status = ?";
      params.push(filters.status);
    }
    const rows = await this.db.all(
      `SELECT r.* FROM replies r ${scope.join} ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    return rows.map(mapReply);
  }

  async create(input: {
    threadId: string;
    authorId: string;
    body: string;
    imagePath?: string | null;
    quoteNo?: number | null;
  }): Promise<Reply> {
    const reply: Reply = {
      id: randomUUID(),
      threadId: input.threadId,
      authorId: input.authorId,
      body: input.body.trim(),
      imagePath: input.imagePath ?? null,
      quoteNo: input.quoteNo ?? null,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await this.db.run(
      `INSERT INTO replies (id, thread_id, author_id, body, image_path, quote_no, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reply.id,
        reply.threadId,
        reply.authorId,
        reply.body,
        reply.imagePath,
        reply.quoteNo,
        reply.status,
        reply.createdAt,
      ],
    );

    return reply;
  }

  async insert(reply: Reply): Promise<void> {
    await this.db.run(
      `INSERT INTO replies (id, thread_id, author_id, body, image_path, quote_no, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reply.id,
        reply.threadId,
        reply.authorId,
        reply.body,
        reply.imagePath,
        reply.quoteNo,
        reply.status,
        reply.createdAt,
      ],
    );
  }

  async moderate(
    replyId: string,
    status: Extract<ContentStatus, "approved" | "rejected">,
  ): Promise<Reply | null> {
    await this.db.run("UPDATE replies SET status = ? WHERE id = ?", [status, replyId]);
    const row = await this.db.get("SELECT * FROM replies WHERE id = ?", [replyId]);
    return row ? mapReply(row) : null;
  }

  async deleteAll(): Promise<void> {
    await this.db.run("DELETE FROM replies");
  }
}
