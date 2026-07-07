import { randomUUID } from "node:crypto";

import type { DatabaseAdapter } from "@/server/db/adapter";
import { boolParam } from "@/server/db/adapter";
import { mapThread } from "@/server/db/mappers";
import type { ContentStatus, Thread } from "@/lib/types";

export class ThreadRepository {
  constructor(private readonly db: DatabaseAdapter) {}

  async findById(id: string): Promise<Thread | null> {
    const row = await this.db.get("SELECT * FROM threads WHERE id = ?", [id]);
    return row ? mapThread(row) : null;
  }

  async findByBoardId(boardId: string): Promise<Thread[]> {
    const rows = await this.db.all("SELECT * FROM threads WHERE board_id = ?", [boardId]);
    return rows.map(mapThread);
  }

  async countByBoardId(boardId: string): Promise<number> {
    const row = await this.db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM threads WHERE board_id = ?",
      [boardId],
    );
    return Number(row?.count ?? 0);
  }

  async findByAuthorId(authorId: string): Promise<Thread[]> {
    const rows = await this.db.all(
      "SELECT * FROM threads WHERE author_id = ? ORDER BY created_at DESC",
      [authorId],
    );
    return rows.map(mapThread);
  }

  async findAll(): Promise<Thread[]> {
    const rows = await this.db.all("SELECT * FROM threads ORDER BY created_at DESC");
    return rows.map(mapThread);
  }

  async findRecent(limit: number, offset = 0): Promise<Thread[]> {
    const rows = await this.db.all(
      "SELECT * FROM threads ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset],
    );
    return rows.map(mapThread);
  }

  async findPending(boardIds?: string[] | null): Promise<Thread[]> {
    if (boardIds && boardIds.length === 0) return [];
    let sql = "SELECT * FROM threads WHERE status = 'pending'";
    const params: unknown[] = [];
    if (boardIds) {
      sql += ` AND board_id IN (${boardIds.map(() => "?").join(",")})`;
      params.push(...boardIds);
    }
    sql += " ORDER BY created_at ASC";
    const rows = await this.db.all(sql, params);
    return rows.map(mapThread);
  }

  private buildFilterSql(filters: {
    boardIds?: string[] | null;
    status?: ContentStatus | null;
  }): { where: string; params: unknown[] } {
    const clauses: string[] = [];
    const params: unknown[] = [];

    if (filters.boardIds) {
      if (filters.boardIds.length === 0) {
        return { where: "WHERE 1 = 0", params: [] };
      }
      clauses.push(`board_id IN (${filters.boardIds.map(() => "?").join(",")})`);
      params.push(...filters.boardIds);
    }
    if (filters.status) {
      clauses.push("status = ?");
      params.push(filters.status);
    }

    return {
      where: clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "",
      params,
    };
  }

  async countFiltered(filters: {
    boardIds?: string[] | null;
    status?: ContentStatus | null;
  }): Promise<number> {
    const { where, params } = this.buildFilterSql(filters);
    const row = await this.db.get<{ count: number }>(
      `SELECT COUNT(*) AS count FROM threads ${where}`,
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
  ): Promise<Thread[]> {
    const { where, params } = this.buildFilterSql(filters);
    const rows = await this.db.all(
      `SELECT * FROM threads ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );
    return rows.map(mapThread);
  }

  async searchAll(): Promise<Thread[]> {
    return this.findAll();
  }

  async getLatestActivityAt(threadId: string): Promise<string> {
    const reply = await this.db.get<{ created_at: string }>(
      "SELECT created_at FROM replies WHERE thread_id = ? ORDER BY created_at DESC LIMIT 1",
      [threadId],
    );
    if (reply) return String(reply.created_at);
    const thread = await this.findById(threadId);
    return thread?.createdAt ?? new Date(0).toISOString();
  }

  async create(input: {
    boardId: string;
    authorId: string;
    authorWasTrusted: boolean;
    title: string;
    body: string;
    imagePath?: string | null;
  }): Promise<Thread> {
    const thread: Thread = {
      id: randomUUID(),
      boardId: input.boardId,
      authorId: input.authorId,
      authorWasTrusted: input.authorWasTrusted,
      title: input.title.trim(),
      body: input.body.trim(),
      imagePath: input.imagePath ?? null,
      status: "pending",
      rejectReason: null,
      createdAt: new Date().toISOString(),
      approvedAt: null,
      viewCount: 0,
    };

    await this.db.run(
      `INSERT INTO threads (
        id, board_id, author_id, author_was_trusted, title, body, image_path,
        status, reject_reason, created_at, approved_at, view_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        thread.id,
        thread.boardId,
        thread.authorId,
        boolParam(thread.authorWasTrusted),
        thread.title,
        thread.body,
        thread.imagePath,
        thread.status,
        thread.rejectReason,
        thread.createdAt,
        thread.approvedAt,
        thread.viewCount,
      ],
    );

    return thread;
  }

  async insert(thread: Thread): Promise<void> {
    await this.db.run(
      `INSERT INTO threads (
        id, board_id, author_id, author_was_trusted, title, body, image_path,
        status, reject_reason, created_at, approved_at, view_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        thread.id,
        thread.boardId,
        thread.authorId,
        boolParam(thread.authorWasTrusted),
        thread.title,
        thread.body,
        thread.imagePath,
        thread.status,
        thread.rejectReason,
        thread.createdAt,
        thread.approvedAt,
        thread.viewCount,
      ],
    );
  }

  async updatePending(
    threadId: string,
    input: { title?: string; body?: string; imagePath?: string | null },
  ): Promise<void> {
    const fields: string[] = [];
    const params: unknown[] = [];

    if (input.title !== undefined) {
      fields.push("title = ?");
      params.push(input.title.trim());
    }
    if (input.body !== undefined) {
      fields.push("body = ?");
      params.push(input.body.trim());
    }
    if (input.imagePath !== undefined) {
      fields.push("image_path = ?");
      params.push(input.imagePath);
    }

    if (fields.length === 0) return;
    params.push(threadId);
    await this.db.run(`UPDATE threads SET ${fields.join(", ")} WHERE id = ?`, params);
  }

  async incrementView(threadId: string): Promise<void> {
    await this.db.run("UPDATE threads SET view_count = view_count + 1 WHERE id = ?", [threadId]);
  }

  async moderate(
    threadId: string,
    status: Extract<ContentStatus, "approved" | "rejected">,
    rejectReason?: string,
  ): Promise<Thread | null> {
    const approvedAt = status === "approved" ? new Date().toISOString() : null;
    const reason = status === "rejected" ? rejectReason?.trim() || "未提供原因" : null;
    await this.db.run(
      "UPDATE threads SET status = ?, reject_reason = ?, approved_at = ? WHERE id = ?",
      [status, reason, approvedAt, threadId],
    );
    return this.findById(threadId);
  }

  async delete(threadId: string): Promise<void> {
    await this.db.run("DELETE FROM threads WHERE id = ?", [threadId]);
  }

  async deleteAll(): Promise<void> {
    await this.db.run("DELETE FROM threads");
  }
}
