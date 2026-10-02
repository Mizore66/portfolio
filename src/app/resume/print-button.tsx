"use client";

import { track } from "@vercel/analytics";

/** The only script on the résumé: opens the browser's print dialog (print, or save as PDF). */
export function PrintButton() {
  return (
    <button
      type="button"
      className="print-button"
      onClick={() => {
        track("resume_open", { paper: "print" });
        window.print();
      }}
    >
      Print or save as PDF
    </button>
  );
}
