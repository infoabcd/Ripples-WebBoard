"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/boards.module.css";
import type { Board, User } from "@/lib/types";
import type { ModeratorRow } from "@/server/services/moderator.service";

function AssignModeratorForm({
  boards,
  users,
}: {
  boards: Board[];
  users: User[];
}) {
  const router = useRouter();
  const [userId, setUserId] = useState(users[0]?.id ?? "");
  const [boardId, setBoardId] = useState(boards[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function assign() {
    if (!userId || !boardId) return;
    setLoading(true);
    setMessage("");
    const res = await fetch("/api/admin/moderators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, boardId }),
    });
    const data = (await res.json()) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setMessage(data.error ?? "指派失敗");
      return;
    }
    router.refresh();
  }

  return (
    <div className={styles.formBox}>
      <h3 className={styles.formTitle}>指派版主</h3>
      <div className={styles.inlineFormRow}>
        <select value={userId} onChange={(e) => setUserId(e.target.value)}>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.displayName} (@{user.username})
            </option>
          ))}
        </select>
        <select value={boardId} onChange={(e) => setBoardId(e.target.value)}>
          {boards.map((board) => (
            <option key={board.id} value={board.id}>
              /{board.slug}/ - {board.name}
            </option>
          ))}
        </select>
        <button type="button" className={styles.btn} disabled={loading} onClick={assign}>
          指派
        </button>
      </div>
      {message ? <p className={styles.error}>{message}</p> : null}
    </div>
  );
}

function UnassignButton({ userId, boardId }: { userId: string; boardId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function unassign() {
    setLoading(true);
    const res = await fetch("/api/admin/moderators", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, boardId }),
    });
    setLoading(false);
    if (!res.ok) return;
    router.refresh();
  }

  return (
    <button type="button" className={styles.btn} disabled={loading} onClick={unassign}>
      移除
    </button>
  );
}

export default function DashboardModerators({
  boards,
  users,
  moderatorRows,
}: {
  boards: Board[];
  users: User[];
  moderatorRows: ModeratorRow[];
}) {
  const rowsByBoard = boards.map((board) => ({
    board,
    moderators: moderatorRows.filter((row) => row.boardId === board.id),
  }));

  return (
    <section>
      {users.length === 0 ? (
        <p className={styles.empty}>沒有可指派的用戶。</p>
      ) : (
        <AssignModeratorForm boards={boards} users={users} />
      )}
      <div className={styles.catalogWrap}>
        <table className={styles.adminTable}>
          <thead>
            <tr>
              <th>分區</th>
              <th>版主</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rowsByBoard.map(({ board, moderators }) =>
              moderators.length === 0 ? (
                <tr key={board.id}>
                  <td>/{board.slug}/</td>
                  <td className={styles.catalogMeta}>—</td>
                  <td>—</td>
                </tr>
              ) : (
                moderators.map((moderator) => (
                  <tr key={`${board.id}-${moderator.userId}`}>
                    <td>/{board.slug}/</td>
                    <td>
                      {moderator.displayName} (@{moderator.username})
                    </td>
                    <td>
                      <UnassignButton userId={moderator.userId} boardId={board.id} />
                    </td>
                  </tr>
                ))
              ),
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
