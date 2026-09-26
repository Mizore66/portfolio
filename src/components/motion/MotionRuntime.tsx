"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { MotionController } from "./motion-core";

/**
 * Loads the motion system after the page is interactive and idle, never under
 * reduced motion, then re-attaches `data-fx` effects after every route change.
 * The site reads completely before, and without, any of this.
 */
export function MotionRuntime() {
  const pathname = usePathname();
  const search = useSearchParams();
  const ctl = useRef<MotionController | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    const load = () =>
      import("./motion-core").then((m) => {
        if (cancelled) return;
        ctl.current = m.startMotion();
        setReady(true);
      });
    const idle = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(load, { timeout: 2000 });
      else setTimeout(load, 800);
    };
    if (document.readyState === "complete") idle();
    else window.addEventListener("load", idle, { once: true });
    return () => {
      cancelled = true;
      ctl.current?.destroy();
      ctl.current = null;
    };
  }, []);

  const query = search.toString();
  useEffect(() => {
    if (!ready || !ctl.current) return;
    // After the new route has painted.
    const id = requestAnimationFrame(() => ctl.current?.attach(document));
    return () => cancelAnimationFrame(id);
  }, [ready, pathname, query]);

  return null;
}
