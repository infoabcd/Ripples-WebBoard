"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/boards.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = (await res.json()) as { error?: string };
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "登入失敗");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form className={styles.formBox} onSubmit={onSubmit}>
      <h2 className={styles.formTitle}>登入</h2>
      <div className={styles.field}>
        <label htmlFor="username">用戶名</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          required
        />
      </div>
      <div className={styles.field}>
        <label htmlFor="password">密碼</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <button type="submit" className={styles.btn} disabled={loading}>
        {loading ? "登入中..." : "登入"}
      </button>
    </form>
  );
}
