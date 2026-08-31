"use client";

import { useState } from "react";
import { BROADSHEET } from "@/content/opening";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="masthead-chip" onClick={() => void onCopy()} data-testid="copy-email">
      {copied ? BROADSHEET.copiedEmail : BROADSHEET.copyEmail}
    </button>
  );
}
