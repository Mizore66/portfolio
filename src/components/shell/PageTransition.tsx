"use client";

import { ViewTransition, useLayoutEffect, type ViewTransitionInstance } from "react";
import { usePathname } from "next/navigation";
import { arrived, startSweep, sweepWithoutSnapshot } from "@/lib/seam/sweep";

/**
 * Wraps every page (it is rendered by app/template.tsx, so it remounts on each navigation). The leaving
 * page becomes a view-transition snapshot that the seam sweeps away (src/lib/seam/sweep.ts); the
 * arriving page is not captured, so it stays live beneath.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  useLayoutEffect(() => {
    arrived(path);
    if (!("startViewTransition" in document)) { sweepWithoutSnapshot(path); return; }
    // if the browser declines the transition, do not leave the seam waiting
    const id = setTimeout(() => sweepWithoutSnapshot(path), 400);
    return () => clearTimeout(id);
  }, [path]);
  return (
    <ViewTransition exit="seam-exit" enter="none" update="none" share="none" default="none" onExit={(i: ViewTransitionInstance) => startSweep(i.name)}>
      <div data-vt-page="">{children}</div>
    </ViewTransition>
  );
}
