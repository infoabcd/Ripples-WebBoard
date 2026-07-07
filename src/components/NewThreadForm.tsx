"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import styles from "@/app/boards.module.css";

export default function NewThreadForm({
  boardSlug,
  boardName,
}: {
  boardSlug: string;
  boardName: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("boardSlug", boardSlug);
    formData.set("title", title);
    formData.set("body", body);
    const file = fileRef.current?.files?.[0];
    if (file) {
      formData.set("image", file);
    }

    const res = await fetch("/api/threads", {
      method: "POST",
      body: formData,
    });

    const data = (await res.json()) as { error?: string; threadId?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "發帖失敗");
      return;
    }

    router.push(`/threads/${data.threadId}`);
    router.refresh();
  }

  return (
    <form className={styles.formBox} onSubmit={onSubmit}>
      <h2 className={styles.formTitle}>
        發帖 · /{boardSlug}/ - {boardName}
      </h2>
      <div className={styles.field}>
        <label htmlFor="title">主題</label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          maxLength={120}
          placeholder="標題"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="body">正文</label>
        <textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          maxLength={8000}
          placeholder="寫點什麼..."
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="image">配圖（可選，僅一張）</label>
        <input
          id="image"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
        />
        <p className={styles.catalogMeta}>一次最多上傳一張圖（你可以跟帖回覆更多圖片）。支援 JPEG / PNG / GIF / WebP，最大 4MB</p>
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? "提交中..." : "提交審核"}
      </button>
    </form>
  );
}
