"use client";

import { useMemo } from "react";
import { layoutTree, OPENING_NODES } from "@/lib/opening/tree";
import type { OpeningNode } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

export function TreeView({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const layout = useMemo(() => layoutTree(), []);
  return (
    <div className="relative overflow-auto px-3 py-4 sm:px-4" data-testid="tree-view">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-faded">
        Life above · mainline centre · variations below · dashed = not taken
      </p>
      <div
        className="relative"
        style={{ width: layout.width, height: layout.height }}
      >
        <span
          className="pointer-events-none absolute left-2 font-mono text-[9px] uppercase tracking-[0.22em] text-faded"
          style={{ top: Math.max(8, layout.mainY - 96) }}
        >
          Life
        </span>
        <span
          className="pointer-events-none absolute left-2 font-mono text-[9px] uppercase tracking-[0.22em] text-faded"
          style={{ top: layout.mainY - 8 }}
        >
          Main
        </span>
        <span
          className="pointer-events-none absolute left-2 font-mono text-[9px] uppercase tracking-[0.22em] text-faded"
          style={{ top: layout.mainY + 88 }}
        >
          Vars
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
            const color =
              n.type === "mainline"
                ? "#1D1A14"
                : n.type === "life"
                  ? "#25457F"
                  : "#8D8574";
            return (
              <line
                key={`${n.parent}-${n.id}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={color}
                strokeWidth={n.type === "mainline" ? 2.5 : 1.5}
                strokeDasharray={dashed ? "6 5" : undefined}
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
  return (
    <button
      type="button"
      data-node-id={node.id}
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(node.id)}
      style={{ left: x, top: y }}
      className={cn(
        "absolute z-10 flex min-w-[4.25rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center border-2 px-1.5 py-1 font-display text-[13px] leading-tight focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2",
        node.type === "mainline" && "border-ink bg-paper font-bold text-book-blue",
        node.type === "life" && "border-book-blue bg-paper text-book-blue",
        node.type === "variation" && "border-faded bg-paper text-ink",
        node.type === "not-taken" && "border-dashed border-faded bg-paper text-faded",
        selected && "border-score-red bg-paper-deep z-20",
      )}
    >
      <span>
        <span className="mr-0.5">{node.fig}</span>
        {node.san}
        {node.sym ? (
          <span className="ml-0.5 font-bold text-score-red">{node.sym}</span>
        ) : null}
      </span>
      <span className="max-w-[7.5rem] truncate font-mono text-[8px] font-normal uppercase tracking-wider text-faded">
        {node.label}
      </span>
    </button>
  );
}
