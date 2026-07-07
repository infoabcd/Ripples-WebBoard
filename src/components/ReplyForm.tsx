"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import styles from "@/app/boards.module.css";

function quotePrefix(quoteNo?: number | null) {
  return quoteNo ? `>>${quoteNo}\n` : "";
}

function ReplyFormInner({
  threadId,
  quoteNo,
  onQuoteChange,
}: {
  threadId: string;
  quoteNo?: number | null;
  onQuoteChange?: (no: number | null) => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState(() => quotePrefix(quoteNo));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.set("body", body);
    if (quoteNo) {
      formData.set("quoteNo", String(quoteNo));
    }
    const file = fileRef.current?.files?.[0];
    if (file) {
      formData.set("image", file);
    }

    const res = await fetch(`/api/threads/${threadId}/replies`, {
      method: "POST",
      body: formData,
    });

    const data = (await res.json()) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "回覆失敗");
      return;
    }

    setBody("");
    if (fileRef.current) fileRef.current.value = "";
    onQuoteChange?.(null);
    router.refresh();
  }

  return (
    <form className={styles.formBox} onSubmit={onSubmit}>
      <h2 className={styles.formTitle}>發表回覆</h2>
      {quoteNo ? (
        <p className={styles.catalogMeta}>
          引用 No.{quoteNo}
          {onQuoteChange ? (
            <>
              {" "}
              [<button type="button" className={styles.linkBtn} onClick={() => onQuoteChange(null)}>
                取消引用
              </button>
              ]
            </>
          ) : null}
        </p>
      ) : null}
      <div className={styles.field}>
        <label htmlFor="reply-body">正文</label>
        <textarea
          id="reply-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          maxLength={4000}
          placeholder=">>1"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="reply-image">配圖（可選，僅一張）</label>
        <input
          id="reply-image"
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
        />
        <p className={styles.catalogMeta}>支援 JPEG / PNG / GIF / WebP，最大 4MB</p>
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? "傳送中..." : "回覆"}
      </button>
    </form>
  );
}

export default function ReplyForm(props: {
  threadId: string;
  quoteNo?: number | null;
  onQuoteChange?: (no: number | null) => void;
}) {
  return <ReplyFormInner key={props.quoteNo ?? "none"} {...props} />;
}
