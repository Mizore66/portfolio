"use client";

import { useEffect, useState } from "react";
import { ArtifactLinks } from "@/components/opening/ArtifactLinks";
import { HalftonePlate } from "@/components/opening/HalftonePlate";
import { formatLine } from "@/lib/opening/tree";
import type { OpeningNode } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

/** Once per visit, in memory — no storage. */
const stampedIds = new Set<string>();

export function AnnotationPanel({ node }: { node: OpeningNode }) {
  return (
    <section className="flex flex-col gap-4" aria-label="Annotation" data-testid="annotation-panel">
      <div key={node.id} className="sheet-fade flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-3 border-b-2 border-ink pb-2">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
              {node.kind}
            </p>
            <p className="font-display text-xl leading-tight text-ink">
              <span className="text-book-blue">
                {node.fig} {node.san}
              </span>
              {node.sym ? <GlyphStamp nodeId={node.id} sym={node.sym} /> : null}
            </p>
          </div>
        </div>

      <h2 className="font-display text-[clamp(1.8rem,3vw,2.4rem)] leading-snug text-ink">{node.title}</h2>

      {node.plate ? (
        <HalftonePlate src={node.plate.src} caption={node.plate.caption} alt={node.title} />
      ) : null}

      <Block kicker="The move" body={node.fact} serif />
      <Block kicker="The annotation" body={node.commentary} italic drop />

      {node.artifacts.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
            Exhibits
          </p>
          <ArtifactLinks artifacts={node.artifacts} />
        </div>
      )}
      </div>

      <p className="font-mono text-[11px] leading-relaxed text-faded">
        <span className="uppercase tracking-[0.18em]">The line so far</span>
        <br />
        <span className="text-ink">{formatLine(node.id)}</span>
      </p>
    </section>
  );
}

function GlyphStamp({ nodeId, sym }: { nodeId: string; sym: string }) {
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
        "ml-1 inline-block text-2xl font-bold text-score-red",
        press && "glyph-stamp",
      )}
    >
      {sym}
    </span>
  );
}

function Block({
  kicker,
  body,
  italic,
  serif,
  drop,
}: {
  kicker: string;
  body: string;
  italic?: boolean;
  serif?: boolean;
  drop?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
        {kicker}
      </p>
      <p
        className={cn(
          italic
            ? "font-lora text-[16px] leading-relaxed text-ink italic"
            : serif
              ? "font-display text-[16px] leading-relaxed text-ink"
              : "text-[16px] leading-relaxed text-ink",
          drop && "drop-cap",
        )}
      >
        {body}
      </p>
    </div>
  );
}
