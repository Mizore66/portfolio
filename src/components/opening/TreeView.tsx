"use client";

import { useMemo } from "react";
import {
  getChildren,
  getNode,
  layoutTree,
  moveHeading,
  OPENING_NODES,
  type Point,
} from "@/lib/opening/tree";
import type { OpeningNode } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

const STEM = 30;

function branchPath(from: Point, to: Point) {
  const midY = from.y + (to.y - from.y) / 2;
  if (from.x === to.x) {
    return `M ${from.x} ${from.y + STEM} V ${to.y - STEM}`;
  }
  return `M ${from.x} ${from.y + STEM} V ${midY} H ${to.x} V ${to.y - STEM}`;
}

export function TreeView({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const layout = useMemo(() => layoutTree(), []);
  const selected = getNode(selectedId);

  return (
    <div className="relative px-4 py-5 sm:px-6" data-testid="tree-view">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-faded">
          Life left · mainline the trunk · variations right · dashed = not taken
        </p>
        <p className="font-mono text-[11px] text-ink">Click a move · ← → steps the trunk</p>
      </div>

      <div className="overflow-auto">
        <div
          className="relative mx-auto"
          style={{ width: layout.width, height: layout.height }}
        >
          <span
            className="pointer-events-none absolute font-mono text-[10px] uppercase tracking-[0.22em] text-faded"
            style={{ left: layout.trunkX - 168, top: 8 }}
          >
            Life
          </span>
          <span
            className="pointer-events-none absolute font-mono text-[10px] uppercase tracking-[0.22em] text-faded"
            style={{ left: layout.trunkX, top: 8, transform: "translateX(-50%)" }}
          >
            Mainline
          </span>
          <span
            className="pointer-events-none absolute font-mono text-[10px] uppercase tracking-[0.22em] text-faded"
            style={{ left: layout.trunkX + 88, top: 8 }}
          >
            Variations
          </span>

          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0"
            width={layout.width}
            height={layout.height}
          >
            {OPENING_NODES.filter((n) => n.parent).map((n) => {
              const from = layout.positions[n.parent!];
              const to = layout.positions[n.id];
              if (!from || !to) return null;
              const dashed = n.type === "not-taken";
              const stroke =
                n.type === "life" ? "#1e3a72" : n.type === "mainline" ? "#1a120c" : "#4a3f34";
              return (
                <path
                  key={`${n.parent}-${n.id}`}
                  d={branchPath(from, to)}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={n.type === "mainline" ? 1.6 : 1.15}
                  strokeDasharray={dashed ? "4 3" : undefined}
                  opacity={dashed ? 0.75 : 1}
                />
              );
            })}
          </svg>

          {OPENING_NODES.map((node) => {
            const pos = layout.positions[node.id];
            if (!pos) return null;
            return (
              <TreeNode
                key={node.id}
                node={node}
                x={pos.x}
                y={pos.y}
                selected={node.id === selectedId}
                onSelect={onSelect}
              />
            );
          })}
        </div>
      </div>

      <p
        data-testid="tree-caption"
        className="mt-5 border-t border-ink pt-3 font-display text-[18px] leading-snug text-ink"
      >
        <span className="text-book-blue">
          {selected.fig} {moveHeading(selected)}
        </span>
        {selected.sym ? (
          <span className="ml-1 font-bold text-score-red">{selected.sym}</span>
        ) : null}
        <span className="mx-2 text-faded">·</span>
        <span>{selected.title}</span>
        <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.18em] text-faded">
          {selected.kind}
        </span>
      </p>
    </div>
  );
}

function TreeNode({
  node,
  x,
  y,
  selected,
  onSelect,
}: {
  node: OpeningNode;
  x: number;
  y: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const label = node.moveNumber === 0 ? "start" : node.san;
  const replies = getChildren(node.id).filter((n) => n.type !== "mainline").length;

  return (
    <button
      type="button"
      data-node-id={node.id}
      aria-current={selected ? "true" : undefined}
      aria-label={`${label} ${node.sym} ${node.title}`.trim()}
      onClick={() => onSelect(node.id)}
      style={{ left: x, top: y }}
      className={cn(
        "absolute z-10 flex w-[148px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-1.5 py-1.5 text-center",
        "bg-paper font-display tracking-tight transition-colors",
        "hover:text-score-red",
        node.type === "mainline" && "text-book-blue",
        node.type === "life" && "text-book-blue",
        node.type === "variation" && "italic text-ink",
        node.type === "not-taken" && "border border-dashed border-ink italic text-ink",
        selected && "z-20 text-score-red not-italic outline outline-2 outline-score-red",
      )}
    >
      <span className="relative leading-none">
        {node.color === "w" && node.moveNumber > 0 ? (
          <span className="mr-1 font-mono text-[10px] font-normal not-italic text-faded">
            {node.moveNumber}.
          </span>
        ) : null}
        {node.moveNumber === 0 ? (
          <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
        ) : (
          <>
            <span className="mr-0.5 text-[15px] font-semibold not-italic">{node.fig}</span>
            <span className="text-[15px] font-semibold">{node.san}</span>
            {node.sym ? (
              <span className="ml-0.5 text-[15px] font-bold not-italic text-score-red">{node.sym}</span>
            ) : null}
          </>
        )}
      </span>
      <span className="mt-1 line-clamp-2 font-lora text-[11px] font-normal not-italic leading-tight text-ink">
        {node.title}
      </span>
      {replies > 0 ? (
        <span className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-faded">
          {replies} alt{replies === 1 ? "" : "s"}
        </span>
      ) : null}
    </button>
  );
}
