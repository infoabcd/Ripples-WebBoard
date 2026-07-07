"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import styles from "@/app/boards.module.css";

export default function EditPendingThread({
  threadId,
  initialTitle,
  initialBody,
  initialImagePath,
}: {
  threadId: string;
  initialTitle: string;
  initialBody: string;
  initialImagePath: string | null;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("title", title);
    formData.set("body", body);
    if (removeImage) {
      formData.set("removeImage", "true");
    }
    const file = fileRef.current?.files?.[0];
    if (file) {
      formData.set("image", file);
    }

    const res = await fetch(`/api/threads/${threadId}`, {
      method: "PATCH",
      body: formData,
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "儲存失敗");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button type="button" className={styles.btn} onClick={() => setOpen(true)}>
        編輯待審主題
      </button>
    );
  }

  return (
    <form className={styles.formBox} onSubmit={onSubmit}>
      <p className={styles.formTitle}>編輯待審主題</p>
      <div className={styles.field}>
        <label htmlFor="edit-title">標題</label>
        <input
          id="edit-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="edit-body">正文</label>
        <textarea
          id="edit-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          maxLength={10000}
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="edit-image">配圖（僅一張）</label>
        {initialImagePath && !removeImage ? (
          <p className={styles.catalogMeta}>
            目前配圖：{initialImagePath}{" "}
            [<button type="button" className={styles.linkBtn} onClick={() => setRemoveImage(true)}>
              移除
            </button>
            ]
          </p>
        ) : null}
        <input
          id="edit-image"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
        />
      </div>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={styles.adminActions}>
        <button type="submit" className={styles.btn} disabled={loading}>
          {loading ? "儲存中..." : "儲存"}
        </button>
        <button type="button" className={styles.btn} disabled={loading} onClick={() => setOpen(false)}>
          取消
        </button>
      </div>
    </form>
  );
}
