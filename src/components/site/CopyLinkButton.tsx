"use client";

import { useEffect, useRef, useState } from "react";

/** Copies this page's URL with the section fragment. */
export function CopyLinkButton({ id, title }: { id: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className="copy-link"
      onClick={async () => {
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // Clipboard blocked: fall back to putting the fragment in the address bar.
          window.location.hash = id;
        }
        setCopied(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(false), 3000);
      }}
    >
      <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      <span className="sr-only"> to {title}</span>
    </button>
  );
}
