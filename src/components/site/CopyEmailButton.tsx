"use client";

import { useState } from "react";

export function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="btn"
      onClick={async () => {
        await navigator.clipboard.writeText(email);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 4000);
      }}
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy email"}</span>
    </button>
  );
}
