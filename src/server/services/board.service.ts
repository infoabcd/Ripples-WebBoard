import { getRepositories } from "@/server/repositories";
import { newBoard } from "@/server/repositories/board.repository";
import type { Board } from "@/lib/types";
import { validateBoardInput } from "@/lib/validate";

export async function listBoards(): Promise<Board[]> {
  return getRepositories().boards.findAll();
}

export async function getBoardBySlug(slug: string): Promise<Board | null> {
  return getRepositories().boards.findBySlug(slug);
}

export async function getBoardById(id: string): Promise<Board | null> {
  return getRepositories().boards.findById(id);
}

export async function countThreadsInBoard(boardId: string): Promise<number> {
  return getRepositories().threads.countByBoardId(boardId);
}

export async function createBoard(input: {
  slug: string;
  name: string;
  description: string;
  sortOrder?: number;
}): Promise<Board | { error: string }> {
  const slug = input.slug.trim().toLowerCase();
  const name = input.name.trim();
  const description = input.description.trim();
  const validationError = validateBoardInput(name, description, slug);
  if (validationError) return { error: validationError };

  const existing = await getBoardBySlug(slug);
  if (existing) return { error: "該 slug 已被使用" };

  const boards = await listBoards();
  const sortOrder = input.sortOrder ?? boards.length + 1;
  const board = newBoard({ slug, name, description, sortOrder });
  await getRepositories().boards.insert(board);
  return board;
}

export async function updateBoard(
  boardId: string,
  input: { slug: string; name: string; description: string; sortOrder: number },
): Promise<Board | { error: string } | null> {
  const board = await getBoardById(boardId);
  if (!board) return null;

  const slug = input.slug.trim().toLowerCase();
  const name = input.name.trim();
  const description = input.description.trim();
  const validationError = validateBoardInput(name, description, slug);
  if (validationError) return { error: validationError };

  if (slug !== board.slug) {
    const taken = await getBoardBySlug(slug);
    if (taken && taken.id !== boardId) return { error: "該 slug 已被使用" };
  }

  return getRepositories().boards.update(boardId, {
    slug,
    name,
    description,
    sortOrder: input.sortOrder,
  });
}

export async function deleteBoard(boardId: string): Promise<{ error: string } | boolean> {
  const board = await getBoardById(boardId);
  if (!board) return false;

  const threadCount = await countThreadsInBoard(boardId);
  if (threadCount > 0) {
    return { error: `該分區仍有 ${threadCount} 個主題，無法刪除` };
  }

  return getRepositories().boards.deleteById(boardId);
}
