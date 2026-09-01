"use client";

import { useState } from "react";
import { BROADSHEET } from "@/content/opening";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        return;
      }
      throw new Error("no clipboard");
    } catch {
      const field = document.createElement("textarea");
      field.value = email;
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
      className="masthead-chip"
      onClick={() => void onCopy()}
      data-testid="copy-email"
      aria-live="polite"
    >
      {copied ? BROADSHEET.copiedEmail : BROADSHEET.copyEmail}
    </button>
  );
}
