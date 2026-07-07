"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/boards.module.css";
import { formatChanDate } from "@/lib/format";
import type { InviteCode } from "@/lib/types";

function CreateInviteForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [note, setNote] = useState("");
  const [maxUses, setMaxUses] = useState("0");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/admin/invite-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code.trim() || undefined,
        note: note.trim() || undefined,
        maxUses: Number(maxUses),
      }),
    });
    const data = (await res.json()) as { error?: string; code?: InviteCode };
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "建立失敗");
      return;
    }
    setCode("");
    setNote("");
    setMaxUses("0");
    setMessage(data.code ? `已建立邀請碼：${data.code.code}` : "已建立");
    router.refresh();
  }

  return (
    <div className={styles.formBox}>
      <h3 className={styles.formTitle}>產生邀請碼</h3>
      <div className={styles.inlineFormRow}>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="留空則隨機產生" />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="備註（可選）" />
        <input
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          type="number"
          min={0}
          placeholder="0=不限"
          title="0 表示不限次數"
          className={styles.inlineInputNarrow}
        />
        <button type="button" className={styles.btn} disabled={loading} onClick={create}>
          產生
        </button>
      </div>
      <p className={styles.catalogMeta}>次數填 0 表示不限，可重複使用；大於 0 則達到上限後失效。</p>
      {error ? <p className={styles.error}>{error}</p> : null}
      {message ? <p className={styles.catalogMeta}>{message}</p> : null}
    </div>
  );
}

function DeleteInviteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function remove() {
    if (!window.confirm("確定刪除該邀請碼？")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/invite-codes/${id}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) return;
    router.refresh();
  }

  return (
    <button type="button" className={styles.btn} disabled={loading} onClick={remove}>
      刪除
    </button>
  );
}

function formatUseLimit(item: InviteCode): string {
  if (item.maxUses <= 0) {
    return `${item.useCount}（不限）`;
  }
  return `${item.useCount} / ${item.maxUses}`;
}

export default function DashboardInviteCodes({ codes }: { codes: InviteCode[] }) {
  return (
    <section>
      <CreateInviteForm />
      {codes.length === 0 ? (
        <p className={styles.empty}>還沒有邀請碼。開啟邀請註冊後，用戶必須憑碼註冊。</p>
      ) : (
        <div className={styles.catalogWrap}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>邀請碼</th>
                <th>備註</th>
                <th>已用</th>
                <th>建立時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((item) => (
                <tr key={item.id}>
                  <td>
                    <code>{item.code}</code>
                  </td>
                  <td>{item.note ?? "—"}</td>
                  <td>{formatUseLimit(item)}</td>
                  <td className={styles.catalogMeta}>{formatChanDate(item.createdAt)}</td>
                  <td>
                    <DeleteInviteButton id={item.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
