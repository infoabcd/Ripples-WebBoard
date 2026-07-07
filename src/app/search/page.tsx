import Link from "next/link";

import styles from "@/app/boards.module.css";
import PageBackBar from "@/components/PageBackBar";
import Pagination from "@/components/Pagination";
import SearchForm from "@/components/SearchForm";
import StatusBadge from "@/components/StatusBadge";
import TopBar from "@/components/TopBar";
import { getSessionUser } from "@/lib/auth";
import { formatChanDate } from "@/lib/format";
import { ensureDatabase } from "@/lib/init";
import { getReplyCount } from "@/server/services/reply.service";
import { searchThreads } from "@/server/services/search.service";
import { getDisplayName } from "@/server/services/user.service";

const PAGE_SIZE = 20;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await ensureDatabase();
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const page = Math.max(1, Number(sp.page) || 1);
  const viewer = await getSessionUser();

  const { threads, total } = query
    ? await searchThreads(query, viewer, { page, pageSize: PAGE_SIZE })
    : { threads: [], total: 0 };
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const basePath = `/search?q=${encodeURIComponent(query)}`;

  return (
    <main className={styles.shell}>
      <TopBar />

      <div className={styles.pageHead}>
        <h1 className={styles.siteTitle} style={{ fontSize: 24 }}>
          搜尋
        </h1>
        <p className={styles.subtitle}>在可見主題與回覆中搜尋</p>
      </div>

      <PageBackBar />

      <SearchForm initialQuery={query} />

      {!query ? (
        <p className={styles.empty}>輸入關鍵字開始搜尋。</p>
      ) : threads.length === 0 ? (
        <p className={styles.empty}>沒有找到與「{query}」相關的主題。</p>
      ) : (
        <>
          <div className={styles.infoStrip}>
            <span>
              共 <strong>{total}</strong> 條結果
            </span>
          </div>
          <div className={styles.catalogWrap}>
            <table className={styles.catalogTable}>
              <thead>
                <tr>
                  <th>主題</th>
                  <th>分區</th>
                  <th>作者</th>
                  <th>R</th>
                  <th>時間</th>
                </tr>
              </thead>
              <tbody>
                {await Promise.all(
                  threads.map(async (thread) => (
                    <tr key={thread.id}>
                      <td className={styles.catalogSubject}>
                        <Link href={`/threads/${thread.id}`}>{thread.title}</Link>{" "}
                        <StatusBadge thread={thread} />
                        {thread.matchSource === "reply" ? (
                          <span className={styles.tagMuted}> [匹配回覆]</span>
                        ) : null}
                      </td>
                      <td>/{thread.boardSlug}/</td>
                      <td>{await getDisplayName(thread.authorId)}</td>
                      <td className={styles.catalogReplies}>{await getReplyCount(thread.id)}</td>
                      <td className={styles.catalogLast}>{formatChanDate(thread.createdAt)}</td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
          <Pagination basePath={basePath} page={safePage} totalPages={totalPages} />
        </>
      )}
    </main>
  );
}
