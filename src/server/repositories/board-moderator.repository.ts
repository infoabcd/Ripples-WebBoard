import type { DatabaseAdapter } from "@/server/db/adapter";

export type BoardModeratorAssignment = {
  userId: string;
  boardId: string;
};

export class BoardModeratorRepository {
  constructor(private readonly db: DatabaseAdapter) {}

  async findBoardIdsByUserId(userId: string): Promise<string[]> {
    const rows = await this.db.all(
      "SELECT board_id FROM board_moderators WHERE user_id = ? ORDER BY board_id ASC",
      [userId],
    );
    return rows.map((row) => String(row.board_id));
  }

  async findUserIdsByBoardId(boardId: string): Promise<string[]> {
    const rows = await this.db.all(
      "SELECT user_id FROM board_moderators WHERE board_id = ? ORDER BY user_id ASC",
      [boardId],
    );
    return rows.map((row) => String(row.user_id));
  }

  async findAll(): Promise<BoardModeratorAssignment[]> {
    const rows = await this.db.all(
      "SELECT user_id, board_id FROM board_moderators ORDER BY board_id ASC, user_id ASC",
    );
    return rows.map((row) => ({
      userId: String(row.user_id),
      boardId: String(row.board_id),
    }));
  }

  async assign(userId: string, boardId: string): Promise<void> {
    const createdAt = new Date().toISOString();
    if (this.db.dialect === "postgres") {
      await this.db.run(
        `INSERT INTO board_moderators (user_id, board_id, created_at) VALUES (?, ?, ?)
         ON CONFLICT DO NOTHING`,
        [userId, boardId, createdAt],
      );
      return;
    }
    if (this.db.dialect === "mariadb") {
      await this.db.run(
        "INSERT IGNORE INTO board_moderators (user_id, board_id, created_at) VALUES (?, ?, ?)",
        [userId, boardId, createdAt],
      );
      return;
    }
    await this.db.run(
      "INSERT OR IGNORE INTO board_moderators (user_id, board_id, created_at) VALUES (?, ?, ?)",
      [userId, boardId, createdAt],
    );
  }

  async unassign(userId: string, boardId: string): Promise<void> {
    await this.db.run("DELETE FROM board_moderators WHERE user_id = ? AND board_id = ?", [
      userId,
      boardId,
    ]);
  }

  async deleteAll(): Promise<void> {
    await this.db.run("DELETE FROM board_moderators");
  }
}
