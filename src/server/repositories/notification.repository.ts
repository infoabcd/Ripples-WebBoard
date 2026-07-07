import { randomUUID } from "node:crypto";

import type { DatabaseAdapter } from "@/server/db/adapter";
import { mapNotification } from "@/server/db/mappers";
import type { Notification, NotificationKind } from "@/lib/types";

export class NotificationRepository {
  constructor(private readonly db: DatabaseAdapter) {}

  async create(input: {
    userId: string;
    kind: NotificationKind;
    title: string;
    body: string;
    link?: string | null;
  }): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      userId: input.userId,
      kind: input.kind,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
      readAt: null,
      createdAt: new Date().toISOString(),
    };

    await this.db.run(
      `INSERT INTO notifications (id, user_id, kind, title, body, link, read_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        notification.id,
        notification.userId,
        notification.kind,
        notification.title,
        notification.body,
        notification.link,
        notification.readAt,
        notification.createdAt,
      ],
    );

    return notification;
  }

  async findByUserId(userId: string, limit = 50): Promise<Notification[]> {
    const rows = await this.db.all(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
      [userId, limit],
    );
    return rows.map(mapNotification);
  }

  async countUnread(userId: string): Promise<number> {
    const row = await this.db.get<{ count: number }>(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL",
      [userId],
    );
    return Number(row?.count ?? 0);
  }

  async markRead(userId: string, notificationId: string): Promise<boolean> {
    const existing = await this.db.get("SELECT id FROM notifications WHERE id = ? AND user_id = ?", [
      notificationId,
      userId,
    ]);
    if (!existing) return false;
    await this.db.run("UPDATE notifications SET read_at = ? WHERE id = ? AND user_id = ?", [
      new Date().toISOString(),
      notificationId,
      userId,
    ]);
    return true;
  }

  async markAllRead(userId: string): Promise<void> {
    await this.db.run("UPDATE notifications SET read_at = ? WHERE user_id = ? AND read_at IS NULL", [
      new Date().toISOString(),
      userId,
    ]);
  }

  async deleteAll(): Promise<void> {
    await this.db.run("DELETE FROM notifications");
  }
}
