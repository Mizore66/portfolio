"use client";

import { useEffect } from "react";

/** Pull webfonts after first paint so they cannot win the LCP race. */
export function FontLoader() {
  useEffect(() => {
    let cancelled = false;
    let idle = 0;
    const run = () => {
      void import("./loadFonts").then(({ loadFonts }) => {
        if (!cancelled) loadFonts();
      });
    };
    if (typeof requestIdleCallback === "function") {
      idle = requestIdleCallback(run, { timeout: 4000 });
    } else {
      idle = window.setTimeout(run, 0);
    }
    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, []);
  return null;
}
