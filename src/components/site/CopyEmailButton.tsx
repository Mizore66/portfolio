"use client";

import { useEffect, useRef, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

const LABEL: Record<CopyState, string> = {
  idle: "Copy email",
  copied: "Copied",
  failed: "Copy failed, select the address above",
};

export function CopyEmailButton({ email }: { email: string }) {
  const [state, setState] = useState<CopyState>("idle");
  // One reset timer at a time: repeat clicks restart it, unmount clears it.
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setState("copied");
        } catch {
          setState("failed");
        }
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setState("idle"), 4000);
      }}
    >
      <span aria-live="polite">{LABEL[state]}</span>
    </button>
  );
}
