import styles from "@/app/boards.module.css";
import type { ContentStatus, Thread } from "@/lib/types";
import { getThreadVisibilityHint, visibilityLabel } from "@/lib/visibility";

export default function StatusBadge({
  thread,
  status,
}: {
  thread?: Pick<Thread, "status" | "authorWasTrusted">;
  status?: ContentStatus;
}) {
  const resolvedStatus = thread?.status ?? status ?? "pending";
  if (resolvedStatus === "approved") return null;

  const hint = thread
    ? getThreadVisibilityHint(thread as Thread)
    : resolvedStatus === "rejected"
      ? "author_only"
      : "mods_only";

  const label =
    thread && resolvedStatus === "pending"
      ? visibilityLabel(hint)
      : resolvedStatus === "rejected"
        ? "已駁回"
        : "待審核";

  return (
    <span className={resolvedStatus === "pending" ? styles.tag : styles.tagMuted}>
      [{label}]
    </span>
  );
}
