"use client";

import { useEffect, useRef } from "react";

export default function ThreadViewRecorder({ threadId }: { threadId: string }) {
  const recorded = useRef(false);

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    void fetch(`/api/threads/${threadId}/view`, { method: "POST" });
  }, [threadId]);

  return null;
}
