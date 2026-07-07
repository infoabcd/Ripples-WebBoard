"use client";

import { useEffect } from "react";

import styles from "@/app/boards.module.css";

function highlightFromHash() {
  document.querySelectorAll(`.${styles.postHighlight}`).forEach((el) => {
    el.classList.remove(styles.postHighlight);
  });

  const hash = window.location.hash;
  if (!hash.startsWith("#p")) return;

  const target = document.querySelector(hash);
  if (!(target instanceof HTMLElement)) return;

  target.classList.add(styles.postHighlight);
  target.scrollIntoView({ behavior: "smooth", block: "center" });

  window.setTimeout(() => {
    target.classList.remove(styles.postHighlight);
  }, 2200);
}

export default function PostHashHighlight() {
  useEffect(() => {
    highlightFromHash();
    window.addEventListener("hashchange", highlightFromHash);
    return () => window.removeEventListener("hashchange", highlightFromHash);
  }, []);

  return null;
}
