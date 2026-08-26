"use client";

import { Fragment } from "react";
import { ArchitectureFigure } from "@/components/opening/ArchitectureFigure";
import { ArtifactLinks } from "@/components/opening/ArtifactLinks";
import { GlyphStamp } from "@/components/opening/GlyphStamp";
import { HalftonePlate } from "@/components/opening/HalftonePlate";
import { MiniBoard } from "@/components/opening/MiniBoard";
import { SpotIllustration } from "@/components/opening/SpotIllustration";
import { BROADSHEET } from "@/content/opening";
import {
  buildNotation,
  collectPlies,
  FLAGSHIP_ID,
  formatLine,
  moveHeading,
  type NotationBlock,
} from "@/lib/opening/tree";
import type { OpeningNode } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

export function NotationView({
  selectedId,
  onSelect,
  onPreview,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  onPreview?: (id: string | null) => void;
}) {
  const blocks = buildNotation();

  return (
    <article aria-label="Scoresheet" className="p-0" data-testid="notation-view">
      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.25em] text-faded">
        {BROADSHEET.gameKicker} · every node, in order
      </p>
      <div className="m-0">
        {blocks.map((block) => (
          <Chapter
            key={block.node.id}
            block={block}
            selectedId={selectedId}
            onSelect={onSelect}
            onPreview={onPreview}
          />
        ))}
      </div>
    </article>
  );
}

function Chapter({
  block,
  selectedId,
  onSelect,
  onPreview,
}: {
  block: NotationBlock;
  selectedId: string;
  onSelect: (id: string) => void;
  onPreview?: (id: string | null) => void;
}) {
  const { node } = block;
  const selected = node.id === selectedId;
  const flagship = node.id === FLAGSHIP_ID;
  const lifeSpot = block.variations
    .map((line) => line[0]?.node)
    .find((n) => n?.type === "life" && n.spot)?.spot;

  return (
    <section
      id={`chapter-${node.id}`}
      data-chapter={node.id}
      className={cn(
        "scroll-mt-4 border-t-2 border-ink py-6",
        flagship && "border-t-[3px]",
      )}
    >
      <header className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
          {node.kind}
        </p>
        <h2
          className={cn(
            "font-display leading-tight text-ink",
            flagship
              ? "mt-1 text-[clamp(2rem,4vw,2.8rem)]"
              : "mt-1 text-[clamp(1.35rem,2.4vw,1.75rem)]",
          )}
        >
          <ChapterButton
            node={node}
            selected={selected}
            onSelect={onSelect}
            onPreview={onPreview}
            stamp={selected && Boolean(node.sym)}
          />
        </h2>
      </header>

      <div className="chapter-copy">
        {node.spot ? <SpotIllustration mark={node.spot} /> : null}
        {lifeSpot ? <SpotIllustration mark={lifeSpot} /> : null}
        {node.plate ? (
          <HalftonePlate
            src={node.plate.src}
            caption={node.plate.caption}
            alt={node.title}
            inset
          />
        ) : null}
        {node.fact ? (
          <p className="drop-cap max-w-prose font-display text-[15.5px] leading-relaxed text-ink">
            {node.fact}
          </p>
        ) : null}
        {node.commentary ? (
          <p className="mt-3 max-w-prose font-lora text-[15px] leading-relaxed italic text-ink">
            {node.commentary}
          </p>
        ) : null}
      </div>

      {node.figure ? (
        <div className="mt-4">
          <ArchitectureFigure
            name={node.figure.name}
            tech={node.figure.tech}
            kicker="Fig. · The apparatus"
          />
        </div>
      ) : null}

      {node.inlineDiagram ? (
        <MiniBoard plies={collectPlies(node.id)} highlight={node.hl} caption={node.cap} />
      ) : null}

      <div className="mt-3">
        <ArtifactLinks artifacts={node.artifacts} />
      </div>

      {block.variations.length > 0 ? (
        <p className="mt-3 max-w-prose font-lora text-[13px] leading-relaxed italic text-ink/90">
          {block.variations.map((line) => (
            <VariationRun
              key={line[0]?.node.id}
              line={line}
              selectedId={selectedId}
              onSelect={onSelect}
              onPreview={onPreview}
            />
          ))}
        </p>
      ) : null}

      <p className="mt-4 font-mono text-[11px] leading-relaxed text-faded">
        <span className="uppercase tracking-[0.18em]">The line so far</span>
        <br />
        <span className="text-ink">{formatLine(node.id)}</span>
      </p>
    </section>
  );
}

function VariationRun({
  line,
  selectedId,
  onSelect,
  onPreview,
}: {
  line: NotationBlock[];
  selectedId: string;
  onSelect: (id: string) => void;
  onPreview?: (id: string | null) => void;
}) {
  return (
    <>
      {" ("}
      {line.map((child, i) => (
        <Fragment key={child.node.id}>
          {i > 0 ? " " : null}
          <ChapterButton
            node={child.node}
            selected={child.node.id === selectedId}
            onSelect={onSelect}
            onPreview={onPreview}
            compact
          />
          {child.node.title ? (
            <span className="not-italic text-faded"> — {child.node.title}</span>
          ) : null}
          {child.node.fact ? <span> {child.node.fact}</span> : null}
          {child.variations.map((nested) => (
            <VariationRun
              key={nested[0]?.node.id}
              line={nested}
              selectedId={selectedId}
              onSelect={onSelect}
              onPreview={onPreview}
            />
          ))}
        </Fragment>
      ))}
      {")"}
    </>
  );
}

function ChapterButton({
  node,
  selected,
  onSelect,
  onPreview,
  compact,
  stamp,
}: {
  node: OpeningNode;
  selected: boolean;
  onSelect: (id: string) => void;
  onPreview?: (id: string | null) => void;
  compact?: boolean;
  stamp?: boolean;
}) {
  return (
    <button
      type="button"
      data-node-id={node.id}
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => onPreview?.(node.id)}
      onMouseLeave={() => onPreview?.(null)}
      onFocus={() => onPreview?.(node.id)}
      onBlur={() => onPreview?.(null)}
      className={cn(
        "inline text-left focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
        compact && "font-display text-[13px] not-italic",
        node.type === "not-taken" && "border border-dashed border-ink px-0.5",
        selected && "bg-score-red/15 box-decoration-clone",
      )}
    >
      <span className={cn(compact ? "text-book-blue" : "text-book-blue")}>
        <span className="mr-1">{node.fig}</span>
        {moveHeading(node)}
      </span>
      {node.sym ? (
        stamp ? (
          <GlyphStamp nodeId={node.id} sym={node.sym} />
        ) : (
          <span className="ml-1 font-bold text-score-red">{node.sym}</span>
        )
      ) : null}
      {!compact ? <span className="ml-2 text-ink">{node.title}</span> : null}
    </button>
  );
}
