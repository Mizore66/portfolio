"use client";

import { Fragment } from "react";
import { ArtifactLinks } from "@/components/opening/ArtifactLinks";
import { ArtistsImpression } from "@/components/opening/ArtistsImpression";
import { GlyphStamp } from "@/components/opening/GlyphStamp";
import { HalftonePlate } from "@/components/opening/HalftonePlate";
import { MiniBoard } from "@/components/opening/MiniBoard";
import { NewsClipping } from "@/components/opening/NewsClipping";
import { PatentFigure } from "@/components/opening/PatentFigure";
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

  return (
    <section
      id={`chapter-${node.id}`}
      data-chapter={node.id}
      className={cn(
        "scroll-mt-4 border-t-2 border-ink py-6",
        flagship && "border-t-[3px]",
      )}
    >
      <div className="mb-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
          {node.kind}
        </p>
        <h2 className="mt-1 font-display text-[clamp(1.5rem,2.5vw,1.85rem)] leading-tight text-ink">
          <ChapterButton
            node={node}
            selected={selected}
            onSelect={onSelect}
            onPreview={onPreview}
            stamp={selected && Boolean(node.sym)}
          />
        </h2>
      </div>

      <div className="chapter-copy">
        {node.clipping ? (
          <NewsClipping
            kicker={node.clipping.kicker}
            headline={node.clipping.headline}
            dateline={node.clipping.dateline}
            src={node.clipping.src}
            caption={node.clipping.caption}
            photoInset={node.clipping.inset}
            alt={node.title}
            inset={!node.clipping.inset}
          />
        ) : null}
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
          <PatentFigure spec={node.figure} />
        </div>
      ) : null}

      {node.inlineDiagram ? (
        <MiniBoard plies={collectPlies(node.id)} highlight={node.hl} caption={node.cap} />
      ) : null}

      <div className="mt-3">
        <ArtifactLinks artifacts={node.artifacts} />
      </div>

      {block.variations.length > 0 ? (
        <div className="mt-3">
          {block.variations.map((line) => {
            const head = line[0]?.node;
            return (
              <div key={head?.id ?? line.map((b) => b.node.id).join("-")} className="mt-3 first:mt-0">
                <div className="chapter-copy">
                {head?.impression ? (
                  <ArtistsImpression
                    src={head.impression.src}
                    caption={head.impression.caption}
                    alt={head.title}
                  />
                ) : null}
                <p className="max-w-prose font-lora text-[13px] leading-relaxed italic text-ink/90">
                  <VariationRun
                    line={line}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onPreview={onPreview}
                  />
                </p>
                {head?.impression && head.commentary ? (
                  <p className="mt-3 max-w-prose font-lora text-[13px] leading-relaxed italic text-ink">
                    {head.commentary}
                  </p>
                ) : null}
                {head?.plate ? (
                  <HalftonePlate
                    src={head.plate.src}
                    caption={head.plate.caption}
                    alt={head.title}
                    inset={Boolean(head.figure)}
                    block={!head.figure}
                  />
                ) : null}
                {head?.figure ? (
                  <div className="mt-4 clear-both">
                    <PatentFigure spec={head.figure} />
                  </div>
                ) : null}
                </div>
              </div>
            );
          })}
        </div>
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
  const spoken = compact
    ? [moveHeading(node), node.sym].filter(Boolean).join(" ")
    : [moveHeading(node), node.sym, node.title].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      data-node-id={node.id}
      aria-label={spoken}
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => onPreview?.(node.id)}
      onMouseLeave={() => onPreview?.(null)}
      onFocus={() => onPreview?.(node.id)}
      onBlur={() => onPreview?.(null)}
      className={cn(
        "inline text-left font-[inherit] text-[1em] leading-[inherit] focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
        compact && "font-display text-[13px] not-italic",
        node.type === "not-taken" && "border border-dashed border-ink px-0.5",
        selected && "bg-score-red/15 box-decoration-clone",
      )}
    >
      <span className="text-book-blue">
        <span className="mr-1" aria-hidden="true">
          {node.fig}
        </span>
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
