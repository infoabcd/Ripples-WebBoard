import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import styles from "@/app/boards.module.css";
import BackLink from "@/components/BackLink";
import NewThreadForm from "@/components/NewThreadForm";
import TopBar from "@/components/TopBar";
import { getSessionUser } from "@/lib/auth";
import { ensureDatabase } from "@/lib/init";
import { getBoardBySlug } from "@/server/services/board.service";

export default async function NewThreadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureDatabase();
  const viewer = await getSessionUser();
  if (!viewer) redirect("/login");

  const { slug } = await params;
  const board = await getBoardBySlug(slug);
  if (!board) notFound();

  return (
    <main className={styles.shell}>
      <TopBar />
      <div className={styles.actionBar}>
        [<BackLink />]
        <span className={styles.topBarSep} />
        [<Link href={`/boards/${board.slug}`}>返回 /{board.slug}/</Link>]
      </div>
      <div className={styles.notice}>提交後將進入待審核狀態，可見範圍取決於你的受信狀態。一次最多上傳一張圖（你可以跟帖回覆更多圖片）。</div>
      <NewThreadForm boardSlug={board.slug} boardName={board.name} />
    </main>
  );
}
