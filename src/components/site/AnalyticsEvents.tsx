"use client";

import { track } from "@vercel/analytics";
import { useEffect } from "react";

/**
 * Brief §1 "Measure it": one delegated listener sends Vercel Web Analytics custom events for
 * email clicks, résumé opens and case-study opens. Copy email and engine start are tracked where
 * they happen. Cookieless; nothing is sent off Vercel.
 */
export function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("mailto:")) return track("email_click");
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === "/print-edition") return track("resume_open", { paper: url.searchParams.get("paper") === "a4" ? "a4" : "letter" });
      const m = url.pathname.match(/^\/projects\/([a-z0-9-]+)$/);
      if (m && url.pathname !== window.location.pathname) track("case_study_open", { slug: m[1] });
    };
    document.addEventListener("click", onClick, { capture: true, passive: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
