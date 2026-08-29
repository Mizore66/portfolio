"use client";

import { useEffect } from "react";

/** Pull webfonts after LCP so 190KB of woff2 cannot win the first-paint race.
 *  next/font/google self-hosts at build — no fonts.googleapis.com at runtime. */
export function FontLoader() {
  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    const run = () => {
      timer = window.setTimeout(() => {
        void import("./loadFonts").then(({ loadFonts }) => {
          if (!cancelled) loadFonts();
        });
      }, 4000);
    };
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("load", run);
    };
  }, []);
  return null;
}
