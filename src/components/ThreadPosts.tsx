"use client";

import { useState } from "react";

import styles from "@/app/boards.module.css";
import PostBox from "@/components/PostBox";
import PostHashHighlight from "@/components/PostHashHighlight";
import ReplyForm from "@/components/ReplyForm";

export type PostItem = {
  id: string;
  name: string;
  username?: string;
  date: string;
  postNo: number;
  body: string;
  imagePath?: string | null;
  quoteNo?: number | null;
  tagLabel?: string | null;
  tagWarn?: boolean;
  variant: "op" | "reply";
};

export default function ThreadPosts({
  posts,
  threadId,
  canReply,
}: {
  posts: PostItem[];
  threadId: string;
  canReply: boolean;
}) {
  const [quoteNo, setQuoteNo] = useState<number | null>(null);

  function getQuoteText(no: number): string | undefined {
    const target = posts.find((p) => p.postNo === no);
    if (!target) return `>>${no}`;
    const excerpt = target.body.replace(/\s+/g, " ").trim().slice(0, 60);
    return `>>${no}\n>${excerpt}${target.body.length > 60 ? "…" : ""}`;
  }

  return (
    <>
      <PostHashHighlight />
      <div className={styles.postList}>
        {posts.map((post) => (
          <PostBox
            key={post.id}
            name={post.name}
            username={post.username}
            date={post.date}
            postNo={post.postNo}
            body={post.body}
            imagePath={post.imagePath}
            quote={post.quoteNo ? getQuoteText(post.quoteNo) : undefined}
            tagLabel={post.tagLabel}
            tagWarn={post.tagWarn}
            variant={post.variant}
            onQuote={canReply ? setQuoteNo : undefined}
          />
        ))}
      </div>
      {canReply ? (
        <>
          <hr className={styles.hr} />
          <ReplyForm threadId={threadId} quoteNo={quoteNo} onQuoteChange={setQuoteNo} />
        </>
      ) : null}
    </>
  );
}
