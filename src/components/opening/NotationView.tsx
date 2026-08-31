"use client";

import dynamic from "next/dynamic";
import { Fragment, memo } from "react";
import { ArtifactLinks } from "@/components/opening/ArtifactLinks";
import { ArtistsImpression } from "@/components/opening/ArtistsImpression";
import { GlyphStamp } from "@/components/opening/GlyphStamp";
import { HalftonePlate } from "@/components/opening/HalftonePlate";
import { InformantMark } from "@/components/opening/InformantMark";
import { MiniBoard } from "@/components/opening/MiniBoard";
import { NewsClipping } from "@/components/opening/NewsClipping";
import { BROADSHEET } from "@/content/opening";
import {
  buildNotation,
  collectPlies,
  FLAGSHIP_ID,
  formatLine,
  moveHeading,
  spokenChapter,
  type NotationBlock,
} from "@/lib/opening/tree";
import type { OpeningNode } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

const PatentFigure = dynamic(
  () => import("@/components/opening/PatentFigure").then((m) => m.PatentFigure),
  { ssr: false },
);

export const NotationView = memo(function NotationView({
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
      <p className="mb-2 font-mono text-[12px] uppercase tracking-[0.25em] text-faded">
        {BROADSHEET.gameKicker} · every node, in order
      </p>
      <p className="mb-8 max-w-[68ch] font-display text-[16px] italic text-faded">
        {BROADSHEET.gameDek}
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
});

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
        "chapter-block scroll-mt-4 border-t-2 border-ink pt-12 pb-8",
        flagship && "chapter-block-flagship border-t-[3px] pt-16 pb-12",
      )}
    >
      <div className="mb-3">
        {node.scanTitle ? (
          <p className="scan-title mb-2 font-display text-[17px] leading-snug text-ink">
            {node.scanTitle}
          </p>
        ) : null}
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
          {node.kind}
        </p>
        <h2 className="mt-2 font-display text-[clamp(1.5rem,2.5vw,1.85rem)] leading-tight text-ink">
          <ChapterButton
            node={node}
            selected={selected}
            flagship={flagship}
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
            alt={node.clipping.alt}
            inset={!node.clipping.inset}
          />
        ) : null}
        {node.plate ? (
          <HalftonePlate
            src={node.plate.src}
            caption={node.plate.caption}
            alt={node.plate.alt}
            inset
          />
        ) : null}
        {node.fact ? (
          <p className="drop-cap chapter-fact max-w-prose font-display text-[16px] leading-[1.65] text-ink">
            {node.fact}
          </p>
        ) : null}
        {node.commentary ? (
          <details className="annotation mt-4">
            <summary className="annotation-summary">Annotation</summary>
            <p className="mt-2 max-w-prose font-lora text-[16px] leading-[1.7] italic text-faded">
              {node.commentary}
            </p>
          </details>
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
                    alt={head.impression.alt}
                  />
                ) : null}
                <p className="max-w-prose font-lora text-[12px] leading-relaxed italic text-ink/90">
                  <VariationRun
                    line={line}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onPreview={onPreview}
                  />
                </p>
                {head?.impression && head.commentary ? (
                  <p className="mt-4 max-w-prose font-lora text-[16px] leading-relaxed italic text-ink">
                    {head.commentary}
                  </p>
                ) : null}
                {head?.plate ? (
                  <HalftonePlate
                    src={head.plate.src}
                    caption={head.plate.caption}
                    alt={head.plate.alt}
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

      {selected ? (
        <p className="line-so-far mt-4 font-mono text-[12px] leading-relaxed text-faded">
          <span className="uppercase tracking-[0.18em]">The line so far</span>
          <br />
          <span className="text-ink">{formatLine(node.id)}</span>
        </p>
      ) : null}
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
  flagship,
}: {
  node: OpeningNode;
  selected: boolean;
  onSelect: (id: string) => void;
  onPreview?: (id: string | null) => void;
  compact?: boolean;
  stamp?: boolean;
  flagship?: boolean;
}) {
  const spoken = spokenChapter(node, compact);

  return (
    <button
      type="button"
      data-node-id={node.id}
      aria-label={spoken}
      aria-current={selected ? "true" : undefined}
      data-flagship-mark={flagship ? "true" : undefined}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => onPreview?.(node.id)}
      onMouseLeave={() => onPreview?.(null)}
      onFocus={() => onPreview?.(node.id)}
      onBlur={() => onPreview?.(null)}
      className={cn(
        "move-tint inline text-left font-[inherit] text-[1em] leading-[inherit] focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
        compact && "notation-hit font-display text-[12px] not-italic",
        node.type === "not-taken" && "border border-dashed border-ink px-1",
        selected && !flagship && "is-selected underline decoration-score-red/50 decoration-2 underline-offset-4",
        selected && flagship && "is-selected",
      )}
    >
      <span aria-hidden="true">
      <span className="text-book-blue">
        <span className="mr-1">{node.fig}</span>
        {moveHeading(node)}
      </span>
      {node.sym ? (
        stamp ? (
          <GlyphStamp nodeId={node.id} sym={node.sym} />
        ) : (
          <InformantMark sym={node.sym} className="ml-1 font-bold text-score-red" />
        )
      ) : null}
      {!compact ? <span className="ml-2 text-ink"> — {node.title}</span> : null}
      </span>
    </button>
  );
}
