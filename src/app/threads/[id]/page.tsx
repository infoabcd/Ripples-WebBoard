import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/app/boards.module.css";
import BackLink from "@/components/BackLink";
import EditPendingThread from "@/components/EditPendingThread";
import ThreadPosts from "@/components/ThreadPosts";
import ThreadToolbar from "@/components/ThreadToolbar";
import ThreadViewRecorder from "@/components/ThreadViewRecorder";
import TopBar from "@/components/TopBar";
import PrefetchLink from "@/components/PrefetchLink";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { isBoardModerator } from "@/lib/permissions";
import { listBoards } from "@/server/services/board.service";
import {
  getFavoriteCount,
  getLikeCount,
  userFavoritedThread,
  userLikedThread,
} from "@/server/services/engagement.service";
import { listRepliesForThread } from "@/server/services/reply.service";
import {
  getThreadById,
} from "@/server/services/thread.service";
import { getDisplayName, getUserById } from "@/server/services/user.service";
import { canViewReply, canViewThread, getThreadVisibilityHint, visibilityLabel } from "@/lib/visibility";

function threadTagLabel(thread: {
  status: string;
  authorWasTrusted: boolean;
}): { label: string | null; warn: boolean } {
  if (thread.status === "approved") return { label: null, warn: false };
  const hint = getThreadVisibilityHint(thread as never);
  const label =
    thread.status === "pending"
      ? visibilityLabel(hint)
      : thread.status === "rejected"
        ? "已駁回"
        : "待審核";
  return { label, warn: thread.status === "pending" };
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await ensureDatabase();
  const { id } = await params;
  const thread = await getThreadById(id);
  if (!thread) notFound();

  const viewer = await getSessionUser();
  if (!canViewThread(viewer, thread)) notFound();

  const boards = await listBoards();
  const board = boards.find((item) => item.id === thread.boardId);
  const allReplies = await listRepliesForThread(thread.id);
  const replies = allReplies.filter((reply) => canViewReply(viewer, thread, reply.status));

  const hintText = visibilityLabel(getThreadVisibilityHint(thread));
  const loggedIn = Boolean(viewer);
  const canDelete =
    viewer &&
    (isBoardModerator(viewer, thread.boardId) ||
      (viewer.id === thread.authorId && thread.status === "pending"));
  const canEdit = viewer?.id === thread.authorId && thread.status === "pending";
  const author = await getUserById(thread.authorId);
  const authorName = author
    ? author.displayName
    : await getDisplayName(thread.authorId);

  const opTag = threadTagLabel(thread);

  const posts = [
    {
      id: thread.id,
      name: authorName,
      username: author?.username,
      date: thread.createdAt,
      postNo: 1,
      body: thread.body,
      imagePath: thread.imagePath,
      quoteNo: null,
      tagLabel: opTag.label,
      tagWarn: opTag.warn,
      variant: "op" as const,
    },
    ...(await Promise.all(
      replies.map(async (reply, index) => {
        const replyAuthor = await getUserById(reply.authorId);
        return {
          id: reply.id,
          name: replyAuthor?.displayName ?? (await getDisplayName(reply.authorId)),
          username: replyAuthor?.username,
          date: reply.createdAt,
          postNo: index + 2,
          body: reply.body,
          imagePath: reply.imagePath,
          quoteNo: reply.quoteNo,
          tagLabel: reply.status === "pending" ? "回覆待審" : null,
          tagWarn: reply.status === "pending",
          variant: "reply" as const,
        };
      }),
    )),
  ];

  return (
    <main className={styles.shell}>
      <ThreadViewRecorder threadId={thread.id} />
      <TopBar />

      <div className={styles.actionBar}>
        [<BackLink />]
        <span className={styles.topBarSep} />
        {board ? (
          <>
            [<PrefetchLink href={`/boards/${board.slug}`}>返回 /{board.slug}/</PrefetchLink>]
            <span className={styles.topBarSep} />
          </>
        ) : null}
        [<Link href="/">首頁</Link>]
        <span className={styles.topBarSep} />
        <span>{replies.length} 回覆</span>
        <span className={styles.topBarSep} />
        <span>{thread.viewCount} 瀏覽</span>
      </div>

      <div className={styles.pageHead}>
        <h1 className={styles.threadTitle}>{thread.title}</h1>
        {board ? (
          <p className={styles.subtitle}>
            分區：<PrefetchLink href={`/boards/${board.slug}`}>/{board.slug}/</PrefetchLink> · 樓主：
            {author ? (
              <Link href={`/u/${author.username}`}>{author.displayName}</Link>
            ) : (
              authorName
            )}
          </p>
        ) : null}
      </div>

      {hintText ? <div className={styles.notice}>{hintText}</div> : null}
      {canEdit ? (
        <div className={styles.actionBar}>
          <EditPendingThread
            threadId={thread.id}
            initialTitle={thread.title}
            initialBody={thread.body}
            initialImagePath={thread.imagePath}
          />
        </div>
      ) : null}
      {thread.status === "rejected" && thread.rejectReason ? (
        <div className={`${styles.notice} ${styles.noticeError}`}>
          駁回原因：{thread.rejectReason}
        </div>
      ) : null}

      <ThreadToolbar
        threadId={thread.id}
        boardSlug={board?.slug ?? "random"}
        liked={viewer ? await userLikedThread(viewer.id, thread.id) : false}
        favorited={viewer ? await userFavoritedThread(viewer.id, thread.id) : false}
        likeCount={await getLikeCount(thread.id)}
        favoriteCount={await getFavoriteCount(thread.id)}
        canDelete={Boolean(canDelete)}
        loggedIn={loggedIn}
      />

      <ThreadPosts posts={posts} threadId={thread.id} canReply={loggedIn} />

      {!loggedIn ? (
        <p className={styles.empty}>
          [<Link href="/login">登入</Link>] 後參與回覆、點讚與收藏
        </p>
      ) : null}
    </main>
  );
}
