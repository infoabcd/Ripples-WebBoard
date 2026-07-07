import { getRepositories } from "@/server/repositories";
import { getUserById } from "@/server/services/user.service";
import type { User } from "@/lib/types";

export type ModeratorRow = {
  boardId: string;
  userId: string;
  username: string;
  displayName: string;
};

export async function listModeratorRows(): Promise<ModeratorRow[]> {
  const assignments = await getRepositories().boardModerators.findAll();
  const rows: ModeratorRow[] = [];

  for (const assignment of assignments) {
    const user = await getUserById(assignment.userId);
    if (!user) continue;
    rows.push({
      boardId: assignment.boardId,
      userId: user.id,
      username: user.username,
      displayName: user.displayName,
    });
  }

  return rows;
}

export async function assignBoardModerator(
  userId: string,
  boardId: string,
): Promise<{ error: string } | User> {
  const user = await getUserById(userId);
  if (!user) return { error: "用戶不存在" };
  if (user.role === "admin") return { error: "站長無需指派版主" };

  const board = await getRepositories().boards.findById(boardId);
  if (!board) return { error: "分區不存在" };

  await getRepositories().boardModerators.assign(userId, boardId);
  if (user.role === "member") {
    const updated = await getRepositories().users.setRole(userId, "moderator");
    return updated ?? user;
  }

  return user;
}

export async function unassignBoardModerator(
  userId: string,
  boardId: string,
): Promise<{ error: string } | User | null> {
  const user = await getUserById(userId);
  if (!user) return { error: "用戶不存在" };
  if (user.role === "admin") return { error: "無法修改站長權限" };

  await getRepositories().boardModerators.unassign(userId, boardId);
  const remaining = await getRepositories().boardModerators.findBoardIdsByUserId(userId);
  if (user.role === "moderator" && remaining.length === 0) {
    const updated = await getRepositories().users.setRole(userId, "member");
    return updated ?? user;
  }

  return user;
}
