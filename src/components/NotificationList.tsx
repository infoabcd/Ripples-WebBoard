"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import styles from "@/app/boards.module.css";
import type { Notification } from "@/lib/types";
import { formatChanDate } from "@/lib/format";

export default function NotificationList({
  initialNotifications,
}: {
  initialNotifications: Notification[];
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [loading, setLoading] = useState(false);

  async function markRead(id: string) {
    setLoading(true);
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLoading(false);
    if (!res.ok) return;
    setNotifications((items) =>
      items.map((item) =>
        item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
      ),
    );
    router.refresh();
  }

  async function markAllRead() {
    setLoading(true);
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    setLoading(false);
    if (!res.ok) return;
    const now = new Date().toISOString();
    setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt ?? now })));
    router.refresh();
  }

  if (notifications.length === 0) {
    return <p className={styles.empty}>暫無通知。</p>;
  }

  return (
    <div>
      <div className={styles.actionBar}>
        <button type="button" className={styles.btn} disabled={loading} onClick={markAllRead}>
          全部標為已讀
        </button>
      </div>
      <div className={styles.notificationList}>
        {notifications.map((item) => (
          <article
            key={item.id}
            className={item.readAt ? styles.notificationRead : styles.notificationUnread}
          >
            <div className={styles.notificationHead}>
              <strong>{item.title}</strong>
              <span className={styles.catalogMeta}>{formatChanDate(item.createdAt)}</span>
            </div>
            <p className={styles.notificationBody}>{item.body}</p>
            <div className={styles.adminActions}>
              {item.link ? (
                <Link href={item.link} className={styles.btn}>
                  查看
                </Link>
              ) : null}
              {!item.readAt ? (
                <button
                  type="button"
                  className={styles.btn}
                  disabled={loading}
                  onClick={() => markRead(item.id)}
                >
                  標為已讀
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
