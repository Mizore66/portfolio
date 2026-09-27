"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { whenIdle, yieldToMain } from "@/lib/idle";
import type { MotionController } from "./motion-core";

/**
 * Loads the motion system after the page is interactive and idle, never under
 * reduced motion and never in the same idle period as the 3D board, then
 * re-attaches `data-fx` effects after every route change.
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
    // One library per task, then the core: no single long evaluation after load.
    whenIdle(async () => {
      for (const step of [() => import("gsap"), () => import("gsap/SplitText"), () => import("lenis")]) {
        if (cancelled) return;
        await step();
        await yieldToMain();
      }
      const m = await import("./motion-core");
      await yieldToMain();
      if (cancelled) return;
      ctl.current = m.startMotion();
      setReady(true);
    }, 2000);
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
