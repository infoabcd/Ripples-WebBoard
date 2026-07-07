"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/boards.module.css";
import type { DashboardBoard } from "@/server/services/dashboard.service";

function BoardEditRow({ board }: { board: DashboardBoard }) {
  const router = useRouter();
  const [slug, setSlug] = useState(board.slug);
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description);
  const [sortOrder, setSortOrder] = useState(String(board.sortOrder));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setLoading(true);
    setMessage("");
    const res = await fetch(`/api/admin/boards/${board.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        name,
        description,
        sortOrder: Number(sortOrder) || 0,
      }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "儲存失敗");
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`確定刪除 /${board.slug}/ ？`)) return;
    setLoading(true);
    setMessage("");
    const res = await fetch(`/api/admin/boards/${board.id}`, { method: "DELETE" });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "刪除失敗");
      return;
    }
    router.refresh();
  }

  return (
    <tr>
      <td>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={styles.inlineInput} />
      </td>
      <td>
        <input value={name} onChange={(e) => setName(e.target.value)} className={styles.inlineInput} />
      </td>
      <td>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.inlineInputWide}
        />
      </td>
      <td>
        <input
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className={styles.inlineInputNarrow}
          type="number"
        />
      </td>
      <td>{board.threadCount}</td>
      <td>
        <div className={styles.adminActions}>
          <button type="button" className={styles.btn} disabled={loading} onClick={save}>
            儲存
          </button>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnDanger}`}
            disabled={loading || board.threadCount > 0}
            onClick={remove}
          >
            刪除
          </button>
        </div>
        {message ? <div className={styles.catalogMeta}>{message}</div> : null}
      </td>
    </tr>
  );
}

function CreateBoardForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function create() {
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/boards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name, description }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "建立失敗");
      return;
    }
    setSlug("");
    setName("");
    setDescription("");
    router.refresh();
  }

  return (
    <div className={styles.formBox}>
      <h3 className={styles.formTitle}>新建分區</h3>
      <div className={styles.inlineFormRow}>
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug" />
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="名稱" />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="描述"
        />
        <button type="button" className={styles.btn} disabled={loading} onClick={create}>
          建立
        </button>
      </div>
      {message ? <p className={styles.error}>{message}</p> : null}
    </div>
  );
}

export default function DashboardBoards({ boards }: { boards: DashboardBoard[] }) {
  return (
    <section>
      <CreateBoardForm />
      <div className={styles.catalogWrap}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>Slug</th>
              <th>名稱</th>
              <th>描述</th>
              <th>排序</th>
              <th>主題數</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {boards.map((board) => (
              <BoardEditRow key={board.id} board={board} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
