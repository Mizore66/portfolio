"use client";

import { ViewTransition, useLayoutEffect, type ViewTransitionInstance } from "react";
import { usePathname } from "next/navigation";
import { arrived, startSweep, sweepWithoutSnapshot } from "@/lib/seam/sweep";
import { after } from "@/lib/motion/slowmo";

/** Routes under /work and /roles have their own templates (app/work, app/roles), so moving between an index and its pages remounts. */
const WORK = /^\/(work|roles)(\/|$)/;

/**
 * Wraps every page (it is rendered by app/template.tsx, so it remounts on each navigation). The leaving
 * page becomes a view-transition snapshot that the seam sweeps away (src/lib/seam/sweep.ts); the
 * arriving page is not captured, so it stays live beneath.
 *
 * A template remounts only when its own segment changes, so /work and /work/<project> share the root's.
 * The Work segment has its own template, `nested`, and there the root one steps aside: one boundary per page.
 */
export function PageTransition({ children, nested = false }: { children: React.ReactNode; nested?: boolean }) {
  const path = usePathname();
  const owns = nested || !WORK.test(path);
  useLayoutEffect(() => {
    if (!owns) return;
    arrived(path);
    if (!("startViewTransition" in document)) { sweepWithoutSnapshot(path); return; }
    // if the browser declines the transition, do not leave the seam waiting
    const id = after(() => sweepWithoutSnapshot(path), 400);
    return () => clearTimeout(id);
  }, [path, owns]);
  if (!owns) return children;
  return (
    <ViewTransition exit="seam-exit" enter="none" update="none" share="none" default="none" onExit={(i: ViewTransitionInstance) => startSweep(i.name)}>
      <div data-vt-page="">{children}</div>
    </ViewTransition>
  );
}
