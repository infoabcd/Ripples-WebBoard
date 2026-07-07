import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "@/app/boards.module.css";
import BackLink from "@/components/BackLink";
import Pagination from "@/components/Pagination";
import PrefetchLink from "@/components/PrefetchLink";
import StatusBadge from "@/components/StatusBadge";
import TopBar from "@/components/TopBar";
import { getSessionUser } from "@/lib/auth";
import { formatChanDate } from "@/lib/format";
import { ensureDatabase } from "@/lib/init";
import type { BoardSort } from "@/lib/types";
import { getBoardBySlug } from "@/server/services/board.service";
import { getReplyCount } from "@/server/services/reply.service";
import {
  getThreadLatestActivity,
  listThreadsForBoard,
} from "@/server/services/thread.service";
import { getDisplayName, getUserById } from "@/server/services/user.service";

const PAGE_SIZE = 15;

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}) {
  await ensureDatabase();
  const { slug } = await params;
  const sp = await searchParams;
  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  const sort: BoardSort = sp.sort === "created" ? "created" : "bump";
  const page = Math.max(1, Number(sp.page) || 1);

  const viewer = await getSessionUser();
  const { threads, total } = await listThreadsForBoard(board.id, viewer, {
    sort,
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const basePath = `/boards/${board.slug}`;

  const rows = await Promise.all(
    threads.map(async (thread, index) => {
      const replies = await getReplyCount(thread.id);
      const lastActivity = await getThreadLatestActivity(thread.id);
      const author = await getUserById(thread.authorId);
      const authorLabel = author?.displayName ?? (await getDisplayName(thread.authorId));
      return { thread, index, replies, lastActivity, author, authorLabel };
    }),
  );

  return (
    <main className={styles.shell}>
      <TopBar />

      <div className={styles.pageHead}>
        <h1 className={styles.boardTitle}>
          <Link href={`/boards/${board.slug}`}>/{board.slug}/</Link> - {board.name}
        </h1>
        <p className={styles.subtitle}>{board.description}</p>
      </div>

      <div className={styles.infoStrip}>
        <span>
          主題 <strong>{total}</strong>
        </span>
        <span>{viewer ? `已登入：${viewer.displayName}` : "訪客瀏覽已通過內容"}</span>
      </div>

      <div className={styles.actionBar}>
        [<BackLink />]
        <span className={styles.topBarSep} />
        [<Link href="/">返回首頁</Link>]
        <span className={styles.topBarSep} />
        {viewer ? (
          <>[<Link href={`/boards/${board.slug}/new`}>新建主題</Link>]</>
        ) : (
          <>[<Link href="/login">登入後發帖</Link>]</>
        )}
      </div>

      <div className={styles.sortBar}>
        <span>排序：</span>
        <Link href={`${basePath}?sort=bump&page=1`} className={sort === "bump" ? styles.activeSort : undefined}>
          最近回覆
        </Link>
        <Link
          href={`${basePath}?sort=created&page=1`}
          className={sort === "created" ? styles.activeSort : undefined}
        >
          發帖時間
        </Link>
      </div>

      {threads.length === 0 ? (
        <p className={styles.empty}>
          這個分區還沒有可見主題。
          {viewer ? (
            <>
              {" "}
              [<Link href={`/boards/${board.slug}/new`}>發第一個帖</Link>]
            </>
          ) : null}
        </p>
      ) : (
        <>
          <div className={styles.catalogWrap}>
            <table className={styles.catalogTable}>
              <thead>
                <tr>
                  <th className={styles.catalogNo}>No.</th>
                  <th className={styles.catalogReplies}>R</th>
                  <th>主題</th>
                  <th className={styles.catalogAuthor}>作者</th>
                  <th className={styles.catalogLast}>最新</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ thread, index, replies, lastActivity, author, authorLabel }) => (
                  <tr key={thread.id}>
                    <td className={styles.catalogNo}>{(safePage - 1) * PAGE_SIZE + index + 1}</td>
                    <td className={styles.catalogReplies}>{replies}</td>
                    <td className={styles.catalogSubject}>
                      <PrefetchLink href={`/threads/${thread.id}`}>{thread.title}</PrefetchLink>{" "}
                      <StatusBadge thread={thread} />
                    </td>
                    <td className={styles.catalogAuthor}>
                      {author ? (
                        <Link href={`/u/${author.username}`}>{authorLabel}</Link>
                      ) : (
                        authorLabel
                      )}
                    </td>
                    <td className={styles.catalogLast}>{formatChanDate(lastActivity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination basePath={basePath} page={safePage} totalPages={totalPages} sort={sort} />
        </>
      )}
    </main>
  );
}
