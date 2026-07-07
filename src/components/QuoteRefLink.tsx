"use client";

import styles from "@/app/boards.module.css";

function highlightPost(postNo: number) {
  const target = document.getElementById(`p${postNo}`);
  if (!target) return;
  target.classList.remove(styles.postHighlight);
  void target.offsetWidth;
  target.classList.add(styles.postHighlight);
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => target.classList.remove(styles.postHighlight), 2200);
}

export default function QuoteRefLink({ text }: { text: string }) {
  const n = Number(text.slice(2));
  if (!Number.isFinite(n) || n <= 0) return <>{text}</>;

  return (
    <a
      href={`#p${n}`}
      className={styles.quoteRef}
      onClick={() => {
        window.location.hash = `p${n}`;
        highlightPost(n);
      }}
    >
      {text}
    </a>
  );
}
