"use client";

import { useEffect, useState } from "react";
import { InformantMark } from "@/components/opening/InformantMark";
import { cn } from "@/lib/utils";

/** Once per visit, in memory — no storage. */
const stampedIds = new Set<string>();

export function GlyphStamp({ nodeId, sym }: { nodeId: string; sym: string }) {
  const [press] = useState(() => !stampedIds.has(nodeId));

  useEffect(() => {
    if (!press) return;
    const timer = window.setTimeout(() => {
      stampedIds.add(nodeId);
    }, 150);
    return () => window.clearTimeout(timer);
  }, [nodeId, press]);

  return (
    <span
      data-testid="glyph-stamp"
      data-stamp={press ? "press" : "seen"}
      className={cn(
        "ml-1 inline-block text-[1.15em] font-bold text-score-red",
        press && "glyph-stamp",
      )}
    >
      <InformantMark sym={sym} />
    </span>
  );
}
