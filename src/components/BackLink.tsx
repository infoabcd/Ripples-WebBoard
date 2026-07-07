"use client";

import { useRouter } from "next/navigation";

export default function BackLink({
  fallbackHref = "/",
  label = "返回上一頁",
}: {
  fallbackHref?: string;
  label?: string;
}) {
  const router = useRouter();

  function handleClick() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <button type="button" onClick={handleClick}>
      {label}
    </button>
  );
}
