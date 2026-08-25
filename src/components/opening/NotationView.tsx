"use client";

import { ArtifactLinks } from "@/components/opening/ArtifactLinks";
import {
  buildNotation,
  moveHeading,
  type NotationBlock,
} from "@/lib/opening/tree";
import type { OpeningNode } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

export function NotationView({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const blocks = buildNotation();

  return (
    <article
      aria-label="Scoresheet"
      className="px-4 py-5 sm:px-6"
      data-testid="notation-view"
    >
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-faded">
        Scoresheet · a plain rendering of every node
      </p>
      <ol className="m-0 list-none p-0">
        {blocks.map((block) => (
          <NotationMove
            key={block.node.id}
            block={block}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </ol>
    </article>
  );
}

function NotationMove({
  block,
  selectedId,
  onSelect,
  nested = false,
}: {
  block: NotationBlock;
  selectedId: string;
  onSelect: (id: string) => void;
  nested?: boolean;
}) {
  const { node } = block;
  const selected = node.id === selectedId;

  return (
    <li
      className={cn(
        "mb-4",
        nested && "mb-2 border-l-2 border-faded/50 pl-3",
        node.type === "not-taken" && "opacity-80",
      )}
    >
      <MoveButton node={node} selected={selected} onSelect={onSelect} />
      {node.fact && (
        <p className="mt-1 max-w-prose font-display text-[15px] leading-relaxed text-ink">
          {node.fact}
        </p>
      )}
      {node.commentary && (
        <p className="mt-1 max-w-prose font-lora text-[14.5px] leading-relaxed text-ink/90 italic">
          {node.commentary}
        </p>
      )}
      <div className="mt-2">
        <ArtifactLinks artifacts={node.artifacts} />
      </div>
      {block.variations.length > 0 && (
        <div className="mt-3 space-y-3 border-l-2 border-ink/20 pl-3">
          {block.variations.map((line) => (
            <div
              key={line[0]?.node.id}
              className={cn(
                "text-ink",
                line[0]?.node.type === "not-taken" && "border-l-2 border-dashed border-faded pl-3",
                line[0]?.node.type === "life" && "border-l-2 border-book-blue pl-3",
              )}
            >
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-faded">
                {line[0]?.node.type === "life"
                  ? "Life"
                  : line[0]?.node.type === "not-taken"
                    ? "Not taken"
                    : "Variation"}
                {line[0]?.node.label ? ` · ${line[0].node.label}` : ""}
              </p>
              <ol className="m-0 list-none p-0">
                {line.map((child) => (
                  <NotationMove
                    key={child.node.id}
                    block={child}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    nested
                  />
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </li>
  );
}

function MoveButton({
  node,
  selected,
  onSelect,
}: {
  node: OpeningNode;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      data-node-id={node.id}
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(node.id)}
      className={cn(
        "group inline-flex flex-wrap items-baseline gap-x-2 text-left focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
        node.type === "not-taken" && "border border-dashed border-ink text-ink",
      )}
    >
      <span
        className={cn(
          "font-display text-lg",
          node.type === "mainline" ? "font-bold text-book-blue" : "text-ink",
          selected && "bg-score-red/15 box-decoration-clone px-0.5",
        )}
      >
        <span className="mr-1 text-[0.95em]">{node.fig}</span>
        {moveHeading(node)}
        {node.sym ? <span className="ml-1 font-bold text-score-red">{node.sym}</span> : null}
      </span>
      <span className="font-display text-base text-ink">{node.title}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-faded">
        {node.kind}
      </span>
    </button>
  );
}
