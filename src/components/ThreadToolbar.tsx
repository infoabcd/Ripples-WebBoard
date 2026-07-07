"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/boards.module.css";

export default function ThreadToolbar({
  threadId,
  boardSlug,
  liked,
  favorited,
  likeCount,
  favoriteCount,
  canDelete,
  loggedIn,
}: {
  threadId: string;
  boardSlug: string;
  liked: boolean;
  favorited: boolean;
  likeCount: number;
  favoriteCount: number;
  canDelete: boolean;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState({ liked, favorited, likeCount, favoriteCount });
  const [loading, setLoading] = useState(false);

  async function toggle(kind: "like" | "favorite") {
    if (!loggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/threads/${threadId}/${kind}`, { method: "POST" });
    const data = (await res.json()) as {
      liked?: boolean;
      favorited?: boolean;
      count: number;
      error?: string;
    };
    setLoading(false);
    if (!res.ok) return;

    if (kind === "like") {
      setState((s) => ({ ...s, liked: Boolean(data.liked), likeCount: data.count }));
    } else {
      setState((s) => ({
        ...s,
        favorited: Boolean(data.favorited),
        favoriteCount: data.count,
      }));
    }
  }

  async function remove() {
    if (!window.confirm("確定刪除這個主題？")) return;
    setLoading(true);
    const res = await fetch(`/api/threads/${threadId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) return;
    router.push(`/boards/${boardSlug}`);
    router.refresh();
  }

  return (
    <div className={styles.interactBar}>
      <button
        type="button"
        className={`${styles.btn} ${state.liked ? styles.btnActive : ""}`}
        disabled={loading}
        onClick={() => toggle("like")}
      >
        {state.liked ? "已讚" : "點讚"} ({state.likeCount})
      </button>
      <button
        type="button"
        className={`${styles.btn} ${state.favorited ? styles.btnActive : ""}`}
        disabled={loading}
        onClick={() => toggle("favorite")}
      >
        {state.favorited ? "已藏" : "收藏"} ({state.favoriteCount})
      </button>
      {canDelete ? (
        <button type="button" className={`${styles.btn} ${styles.btnDanger}`} disabled={loading} onClick={remove}>
          刪除主題
        </button>
      ) : null}
    </div>
  );
}
