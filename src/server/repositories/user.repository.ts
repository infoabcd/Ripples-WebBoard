import { randomUUID } from "node:crypto";

import type { DatabaseAdapter } from "@/server/db/adapter";
import { boolParam } from "@/server/db/adapter";
import { mapUser } from "@/server/db/mappers";
import type { User } from "@/lib/types";

export class UserRepository {
  constructor(private readonly db: DatabaseAdapter) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.get("SELECT * FROM users WHERE id = ?", [id]);
    return row ? mapUser(row) : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.db.get("SELECT * FROM users WHERE username = ?", [
      username.trim().toLowerCase(),
    ]);
    return row ? mapUser(row) : null;
  }

  async count(): Promise<number> {
    const row = await this.db.get<{ count: number }>("SELECT COUNT(*) AS count FROM users");
    return Number(row?.count ?? 0);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db.all("SELECT * FROM users ORDER BY created_at ASC");
    return rows.map(mapUser);
  }

  async findPage(limit: number, offset: number): Promise<User[]> {
    const rows = await this.db.all(
      "SELECT * FROM users ORDER BY created_at ASC LIMIT ? OFFSET ?",
      [limit, offset],
    );
    return rows.map(mapUser);
  }

  async create(input: {
    username: string;
    passwordHash: string;
    displayName: string;
    email?: string | null;
    isTrusted?: boolean;
  }): Promise<User> {
    const now = new Date().toISOString();
    const isTrusted = input.isTrusted ?? false;
    const user: User = {
      id: randomUUID(),
      username: input.username,
      passwordHash: input.passwordHash,
      displayName: input.displayName,
      email: input.email ?? null,
      role: "member",
      isTrusted,
      trustedAt: isTrusted ? now : null,
      createdAt: now,
    };

    await this.db.run(
      `INSERT INTO users (id, username, password_hash, display_name, email, role, is_trusted, trusted_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.username,
        user.passwordHash,
        user.displayName,
        user.email,
        user.role,
        boolParam(user.isTrusted),
        user.trustedAt,
        user.createdAt,
      ],
    );

    return user;
  }

  async insert(user: User): Promise<void> {
    await this.db.run(
      `INSERT INTO users (id, username, password_hash, display_name, email, role, is_trusted, trusted_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id,
        user.username,
        user.passwordHash,
        user.displayName,
        user.email,
        user.role,
        boolParam(user.isTrusted),
        user.trustedAt,
        user.createdAt,
      ],
    );
  }

  async setEmail(userId: string, email: string | null): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) return null;
    await this.db.run("UPDATE users SET email = ? WHERE id = ?", [email, userId]);
    return { ...user, email };
  }

  async setTrusted(userId: string, isTrusted: boolean): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) return null;
    const trustedAt = isTrusted ? new Date().toISOString() : null;
    await this.db.run("UPDATE users SET is_trusted = ?, trusted_at = ? WHERE id = ?", [
      boolParam(isTrusted),
      trustedAt,
      userId,
    ]);
    return { ...user, isTrusted, trustedAt };
  }

  async setRole(userId: string, role: User["role"]): Promise<User | null> {
    const user = await this.findById(userId);
    if (!user) return null;
    await this.db.run("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    return { ...user, role };
  }

  async deleteAll(): Promise<void> {
    await this.db.run("DELETE FROM users");
  }
}
