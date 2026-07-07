"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/boards.module.css";

export function ModerateButtons({
  threadId,
  compact = false,
}: {
  threadId: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("不符合分區規範");

  async function moderate(action: "approve" | "reject") {
    setLoading(true);
    const res = await fetch(`/api/admin/threads/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        rejectReason: action === "reject" ? rejectReason : undefined,
      }),
    });
    setLoading(false);
    if (!res.ok) return;
    setShowReject(false);
    router.refresh();
  }

  return (
    <div>
      <div className={styles.adminActions}>
        <button type="button" className={styles.btn} disabled={loading} onClick={() => moderate("approve")}>
          {compact ? "✓" : "通過"}
        </button>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnDanger}`}
          disabled={loading}
          onClick={() => setShowReject((v) => !v)}
        >
          {compact ? "✗" : "駁回"}
        </button>
      </div>
      {showReject ? (
        <div className={styles.rejectBox}>
          <input
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="駁回原因"
          />
          <button type="button" className={styles.btn} disabled={loading} onClick={() => moderate("reject")}>
            確認駁回
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function ReplyModerateButtons({ replyId }: { replyId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function moderate(action: "approve" | "reject") {
    setLoading(true);
    const res = await fetch(`/api/admin/replies/${replyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    if (!res.ok) return;
    router.refresh();
  }

  return (
    <div className={styles.adminActions}>
      <button type="button" className={styles.btn} disabled={loading} onClick={() => moderate("approve")}>
        通過
      </button>
      <button
        type="button"
        className={`${styles.btn} ${styles.btnDanger}`}
        disabled={loading}
        onClick={() => moderate("reject")}
      >
        駁回
      </button>
    </div>
  );
}

export function TrustToggle({
  userId,
  isTrusted,
}: {
  userId: string;
  isTrusted: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${userId}/trust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTrusted: !isTrusted }),
    });
    setLoading(false);
    if (!res.ok) return;
    router.refresh();
  }

  return (
    <button type="button" className={styles.btn} disabled={loading} onClick={toggle}>
      {isTrusted ? "撤銷受信" : "設為受信"}
    </button>
  );
}
