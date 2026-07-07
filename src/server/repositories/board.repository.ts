import { randomUUID } from "node:crypto";

import type { DatabaseAdapter } from "@/server/db/adapter";
import { mapBoard } from "@/server/db/mappers";
import type { Board } from "@/lib/types";

export class BoardRepository {
  constructor(private readonly db: DatabaseAdapter) {}

  async findAll(): Promise<Board[]> {
    const rows = await this.db.all("SELECT * FROM boards ORDER BY sort_order ASC");
    return rows.map(mapBoard);
  }

  async findBySlug(slug: string): Promise<Board | null> {
    const row = await this.db.get("SELECT * FROM boards WHERE slug = ?", [slug]);
    return row ? mapBoard(row) : null;
  }

  async findById(id: string): Promise<Board | null> {
    const row = await this.db.get("SELECT * FROM boards WHERE id = ?", [id]);
    return row ? mapBoard(row) : null;
  }

  async count(): Promise<number> {
    const row = await this.db.get<{ count: number }>("SELECT COUNT(*) AS count FROM boards");
    return Number(row?.count ?? 0);
  }

  async insert(board: Board): Promise<void> {
    await this.db.run(
      `INSERT INTO boards (id, slug, name, description, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [board.id, board.slug, board.name, board.description, board.sortOrder, board.createdAt],
    );
  }

  async update(
    id: string,
    input: { slug: string; name: string; description: string; sortOrder: number },
  ): Promise<Board | null> {
    const existing = await this.findById(id);
    if (!existing) return null;
    await this.db.run(
      `UPDATE boards SET slug = ?, name = ?, description = ?, sort_order = ? WHERE id = ?`,
      [input.slug, input.name, input.description, input.sortOrder, id],
    );
    return {
      ...existing,
      slug: input.slug,
      name: input.name,
      description: input.description,
      sortOrder: input.sortOrder,
    };
  }

  async deleteById(id: string): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing) return false;
    await this.db.run("DELETE FROM boards WHERE id = ?", [id]);
    return true;
  }

  async deleteAll(): Promise<void> {
    await this.db.run("DELETE FROM boards");
  }
}

export function newBoard(input: Omit<Board, "id" | "createdAt"> & { id?: string; createdAt?: string }): Board {
  return {
    id: input.id ?? randomUUID(),
    slug: input.slug,
    name: input.name,
    description: input.description,
    sortOrder: input.sortOrder,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}
