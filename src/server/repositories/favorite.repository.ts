import type { DatabaseAdapter } from "@/server/db/adapter";
import type { ThreadFavorite } from "@/lib/types";

export class FavoriteRepository {
  constructor(private readonly db: DatabaseAdapter) {}

  async countByThreadId(threadId: string): Promise<number> {
    const row = await this.db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM thread_favorites WHERE thread_id = ?",
      [threadId],
    );
    return Number(row?.count ?? 0);
  }

  async exists(userId: string, threadId: string): Promise<boolean> {
    const row = await this.db.get(
      "SELECT 1 FROM thread_favorites WHERE user_id = ? AND thread_id = ?",
      [userId, threadId],
    );
    return Boolean(row);
  }

  async findThreadIdsByUser(userId: string): Promise<ThreadFavorite[]> {
    const rows = await this.db.all(
      "SELECT * FROM thread_favorites WHERE user_id = ? ORDER BY created_at DESC",
      [userId],
    );
    return rows.map((row) => ({
      userId: String(row.user_id),
      threadId: String(row.thread_id),
      createdAt: String(row.created_at),
    }));
  }

  async toggle(userId: string, threadId: string): Promise<{ favorited: boolean; count: number }> {
    const exists = await this.exists(userId, threadId);
    if (exists) {
      await this.db.run("DELETE FROM thread_favorites WHERE user_id = ? AND thread_id = ?", [
        userId,
        threadId,
      ]);
    } else {
      await this.db.run(
        "INSERT INTO thread_favorites (user_id, thread_id, created_at) VALUES (?, ?, ?)",
        [userId, threadId, new Date().toISOString()],
      );
    }
    const count = await this.countByThreadId(threadId);
    return { favorited: !exists, count };
  }

  async insert(favorite: ThreadFavorite): Promise<void> {
    await this.db.run(
      "INSERT INTO thread_favorites (user_id, thread_id, created_at) VALUES (?, ?, ?)",
      [favorite.userId, favorite.threadId, favorite.createdAt],
    );
  }

  async deleteAll(): Promise<void> {
    await this.db.run("DELETE FROM thread_favorites");
  }

  async countAll(): Promise<number> {
    const row = await this.db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM thread_favorites",
    );
    return Number(row?.count ?? 0);
  }
}
