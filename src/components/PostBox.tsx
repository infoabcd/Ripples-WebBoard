"use client";

import Link from "next/link";

import styles from "@/app/boards.module.css";
import PostBody from "@/components/PostBody";
import { formatChanDate } from "@/lib/format";

export default function PostBox({
  name,
  username,
  date,
  postNo,
  body,
  imagePath,
  quote,
  tagLabel,
  tagWarn,
  variant = "reply",
  onQuote,
}: {
  name: string;
  username?: string;
  date: string;
  postNo: number;
  body: string;
  imagePath?: string | null;
  quote?: string;
  tagLabel?: string | null;
  tagWarn?: boolean;
  variant?: "op" | "reply";
  onQuote?: (postNo: number) => void;
}) {
  const className = [
    styles.post,
    variant === "op" ? styles.postOp : styles.postReply,
  ].join(" ");

  return (
    <article className={className} id={`p${postNo}`}>
      <div className={styles.postInfo}>
        {username ? (
          <Link href={`/u/${username}`} prefetch={false} className={styles.nameLink}>
            {name}
          </Link>
        ) : (
          <span className={styles.name}>{name}</span>
        )}
        <span className={styles.date}> {formatChanDate(date)}</span>
        <a href={`#p${postNo}`} className={styles.no}>
          No.{postNo}
        </a>
        {onQuote ? (
          <button type="button" className={styles.linkBtn} onClick={() => onQuote(postNo)}>
            [引用]
          </button>
        ) : null}
        {tagLabel ? (
          <span className={tagWarn ? styles.tag : styles.tagMuted}>[{tagLabel}]</span>
        ) : null}
      </div>
      {quote ? (
        <div className={styles.quote}>
          <PostBody body={quote} />
        </div>
      ) : null}
      <PostBody body={body} />
      {imagePath ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imagePath} alt="" className={styles.postImage} />
      ) : null}
    </article>
  );
}
