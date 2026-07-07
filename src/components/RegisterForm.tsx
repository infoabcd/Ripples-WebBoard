"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/boards.module.css";

export default function RegisterForm({
  inviteRequired = true,
  contactEmail = "",
}: {
  inviteRequired?: boolean;
  contactEmail?: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("兩次輸入的密碼不一致");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        displayName: displayName || username,
        email: email || undefined,
        inviteCode: inviteRequired ? inviteCode : undefined,
      }),
    });

    const data = (await res.json()) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "註冊失敗");
      return;
    }

    router.push("/me");
    router.refresh();
  }

  return (
    <form className={styles.formBox} onSubmit={onSubmit}>
      <h2 className={styles.formTitle}>註冊</h2>
      {inviteRequired ? (
        <div className={styles.field}>
          <label htmlFor="inviteCode">邀請碼</label>
          <input
            id="inviteCode"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            required
            autoComplete="off"
            placeholder="Dontalk(.org) 邀請碼"
          />
          {contactEmail ? (
            <p className={styles.catalogMeta}>
              沒有邀請碼？請電郵聯繫{" "}
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </p>
          ) : (
            <p className={styles.catalogMeta}>沒有邀請碼？請聯繫管理員索取。</p>
          )}
        </div>
      ) : null}
      <p className={styles.subtitle} style={{ marginBottom: 10 }}>
        新帳號預設<strong>不受信</strong>，待審帖僅管理員可見。
        {inviteRequired ? " 一人註冊多個帳號將會被永久封禁(3個及以上)。" : null}
      </p>
      <div className={styles.field}>
        <label htmlFor="username">用戶名</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
          pattern="[a-z0-9_]{3,20}"
          placeholder="小寫字母/數字/底線"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="displayName">顯示名稱</label>
        <input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={24}
          placeholder="可選，預設同用戶名相同"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="email">電郵（可選，用於推送審核通知）</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="example@email.com"
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">密碼</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="password"
          />
      </div>
      <div className={styles.field}>
        <label htmlFor="confirmPassword">確認密碼</label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="password"
        />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? "註冊中..." : "註冊並登入"}
      </button>
    </form>
  );
}
