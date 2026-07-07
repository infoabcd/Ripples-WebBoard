import { getRepositories } from "@/server/repositories";
import { getThreadById } from "@/server/services/thread.service";
import type { Thread } from "@/lib/types";

export async function getLikeCount(threadId: string): Promise<number> {
  return getRepositories().likes.countByThreadId(threadId);
}

export async function getFavoriteCount(threadId: string): Promise<number> {
  return getRepositories().favorites.countByThreadId(threadId);
}

export async function userLikedThread(userId: string, threadId: string): Promise<boolean> {
  return getRepositories().likes.exists(userId, threadId);
}

export async function userFavoritedThread(userId: string, threadId: string): Promise<boolean> {
  return getRepositories().favorites.exists(userId, threadId);
}

export async function toggleLike(
  userId: string,
  threadId: string,
): Promise<{ liked: boolean; count: number }> {
  return getRepositories().likes.toggle(userId, threadId);
}

export async function toggleFavorite(
  userId: string,
  threadId: string,
): Promise<{ favorited: boolean; count: number }> {
  return getRepositories().favorites.toggle(userId, threadId);
}

export async function listUserLikedThreads(userId: string): Promise<Thread[]> {
  const likes = await getRepositories().likes.findThreadIdsByUser(userId);
  const threads = await Promise.all(likes.map((like) => getThreadById(like.threadId)));
  return threads.filter((thread): thread is Thread => Boolean(thread));
}

export async function listUserFavoriteThreads(userId: string): Promise<Thread[]> {
  const favorites = await getRepositories().favorites.findThreadIdsByUser(userId);
  const threads = await Promise.all(favorites.map((fav) => getThreadById(fav.threadId)));
  return threads.filter((thread): thread is Thread => Boolean(thread));
}
