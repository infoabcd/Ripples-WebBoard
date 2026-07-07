"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/boards.module.css";

export default function SearchForm({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form className={styles.searchForm} onSubmit={onSubmit}>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜尋主題標題或正文"
        aria-label="搜尋主題"
        maxLength={100}
      />
      <button type="submit">搜尋</button>
    </form>
  );
}
