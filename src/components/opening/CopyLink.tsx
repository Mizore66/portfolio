"use client";

import { useEffect, useState } from "react";
import { BROADSHEET } from "@/content/opening";

export function CopyLink({ href, label }: { href: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function onCopy() {
    const url = href.startsWith("#")
      ? `${window.location.origin}${window.location.pathname}${href}`
      : href.startsWith("http") || href.startsWith("/")
        ? new URL(href, window.location.origin).href
        : href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        return;
      }
      throw new Error("no clipboard");
    } catch {
      const field = document.createElement("textarea");
      field.value = url;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      field.remove();
      setCopied(ok);
    }
  }

  return (
    <button
      type="button"
      className="copy-link"
      onClick={() => void onCopy()}
      data-testid="copy-link"
      aria-label={label ?? BROADSHEET.copyLink}
      aria-live="polite"
    >
      {copied ? BROADSHEET.copiedLink : BROADSHEET.copyLink}
    </button>
  );
}
