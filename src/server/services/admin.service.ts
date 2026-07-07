import { getRepositories } from "@/server/repositories";
import type { AdminStats } from "@/lib/admin";
import { threadInScope } from "@/lib/permissions";

export type AdminDashboardData = AdminStats & {
  likes: number;
  favorites: number;
};

export async function getAdminStats(
  scopeBoardIds: string[] | null = null,
): Promise<AdminDashboardData> {
  const repos = getRepositories();
  const allThreads = (await repos.threads.findAll()).filter((thread) =>
    threadInScope(thread.boardId, scopeBoardIds),
  );

  const threadIds = new Set(allThreads.map((thread) => thread.id));
  const allReplies = (await repos.replies.findAll()).filter((reply) =>
    threadIds.has(reply.threadId),
  );

  const boards = scopeBoardIds
    ? (await repos.boards.findAll()).filter((board) => scopeBoardIds.includes(board.id))
    : await repos.boards.findAll();

  let likes = 0;
  if (scopeBoardIds) {
    for (const thread of allThreads) {
      likes += await repos.likes.countByThreadId(thread.id);
    }
  } else {
    likes = await repos.likes.countAll();
  }

  return {
    boards: boards.length,
    users: scopeBoardIds ? 0 : await repos.users.count(),
    likes,
    favorites: scopeBoardIds ? 0 : await repos.favorites.countAll(),
    threads: {
      total: allThreads.length,
      pending: allThreads.filter((t) => t.status === "pending").length,
      approved: allThreads.filter((t) => t.status === "approved").length,
      rejected: allThreads.filter((t) => t.status === "rejected").length,
    },
    replies: {
      total: allReplies.length,
      pending: allReplies.filter((r) => r.status === "pending").length,
      approved: allReplies.filter((r) => r.status === "approved").length,
      rejected: allReplies.filter((r) => r.status === "rejected").length,
    },
  };
}

export async function listAllUsers() {
  return getRepositories().users.findAll();
}
