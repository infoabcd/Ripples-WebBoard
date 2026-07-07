"use client";

import { useState } from "react";

import styles from "@/app/boards.module.css";

export default function EmailSettings({
  initialEmail,
  emailEnabled,
}: {
  initialEmail: string | null;
  emailEnabled: boolean;
}) {
  const [email, setEmail] = useState(initialEmail ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/me/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = (await res.json()) as { error?: string; email?: string | null };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "儲存失敗");
      return;
    }
    setEmail(data.email ?? "");
    setMessage("電郵已更新");
  }

  return (
    <div className={styles.formBox}>
      <h2 className={styles.formTitle}>通知電郵</h2>
      <p className={styles.subtitle} style={{ marginBottom: 10 }}>
        用於接收審核結果電郵。
        {emailEnabled ? " 站点已启用 SMTP。" : " 站点未配置 SMTP，僅显示站内通知。"}
      </p>
      <div className={styles.field}>
        <label htmlFor="notify-email">電郵（可選）</label>
        <input
          id="notify-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@email.com"
        />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.catalogMeta}>{message}</p> : null}
      <button type="button" className={styles.btn} disabled={loading} onClick={save}>
        {loading ? "儲存中..." : "儲存電郵"}
      </button>
    </div>
  );
}
