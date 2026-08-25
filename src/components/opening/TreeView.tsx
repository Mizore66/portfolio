"use client";

import { useMemo } from "react";
import {
  getMainline,
  getNode,
  layoutTree,
  moveHeading,
  OPENING_NODES,
} from "@/lib/opening/tree";
import type { OpeningNode } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

function elbow(from: { x: number; y: number }, to: { x: number; y: number }) {
  const midX = (from.x + to.x) / 2;
  return `M ${from.x} ${from.y} H ${midX} V ${to.y} H ${to.x}`;
}

export function TreeView({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const layout = useMemo(() => layoutTree(), []);
  const mainline = useMemo(() => getMainline(), []);
  const selected = getNode(selectedId);
  const mainPts = mainline
    .map((n) => layout.positions[n.id])
    .filter(Boolean);

  const staff = mainPts.length
    ? `M ${mainPts[0].x} ${layout.mainY} H ${mainPts[mainPts.length - 1].x}`
    : "";

  return (
    <div className="relative px-4 py-6 sm:px-6" data-testid="tree-view">
      <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-faded">
        Life above · mainline on the staff · variations below · dashed = not taken
      </p>

      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{ width: layout.width, height: layout.height }}
        >
          <span
            className="pointer-events-none absolute left-0 font-mono text-[9px] uppercase tracking-[0.28em] text-faded"
            style={{ top: Math.max(6, layout.mainY - 70) }}
          >
            Life
          </span>
          <span
            className="pointer-events-none absolute left-0 font-mono text-[9px] uppercase tracking-[0.28em] text-faded"
            style={{ top: layout.mainY - 7 }}
          >
            Main
          </span>
          <span
            className="pointer-events-none absolute left-0 font-mono text-[9px] uppercase tracking-[0.28em] text-faded"
            style={{ top: layout.mainY + 62 }}
          >
            Vars
          </span>

          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0"
            width={layout.width}
            height={layout.height}
          >
            {staff ? (
              <path d={staff} fill="none" stroke="#1d1a14" strokeWidth="1.5" />
            ) : null}
            {OPENING_NODES.filter((n) => n.parent && n.type !== "mainline").map((n) => {
              const from = layout.positions[n.parent!];
              const to = layout.positions[n.id];
              if (!from || !to) return null;
              const dashed = n.type === "not-taken";
              return (
                <path
                  key={`${n.parent}-${n.id}`}
                  d={elbow(from, to)}
                  fill="none"
                  stroke={n.type === "life" ? "#25457f" : "#8d8574"}
                  strokeWidth="1"
                  strokeDasharray={dashed ? "5 4" : undefined}
                  opacity="0.85"
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
        className="mt-6 max-w-2xl border-t border-ink/20 pt-3 font-display text-[17px] leading-snug text-ink"
      >
        <span className="text-book-blue">
          {selected.fig} {moveHeading(selected)}
        </span>
        {selected.sym ? (
          <span className="ml-1 font-bold text-score-red">{selected.sym}</span>
        ) : null}
        <span className="mx-2 text-faded">·</span>
        <span>{selected.title}</span>
        <span className="ml-2 font-mono text-[10px] uppercase tracking-[0.2em] text-faded">
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

  return (
    <button
      type="button"
      data-node-id={node.id}
      aria-current={selected ? "true" : undefined}
      aria-label={`${label} ${node.sym} ${node.title}`.trim()}
      onClick={() => onSelect(node.id)}
      style={{ left: x, top: y }}
      className={cn(
        "absolute z-10 flex h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center px-1.5 font-display tracking-tight",
        "hover:bg-ink/[0.05]",
        node.type === "mainline" && "text-[15px] font-semibold text-book-blue",
        node.type === "life" && "text-[13px] text-book-blue",
        node.type === "variation" && "text-[13px] text-ink/75",
        node.type === "not-taken" && "text-[13px] text-faded",
        selected && "z-20 bg-score-red/10 text-score-red shadow-[0_2px_0_0_#a2322a]",
      )}
    >
      {node.moveNumber === 0 ? (
        <span className="font-mono text-[10px] uppercase tracking-widest">{label}</span>
      ) : (
        <span>
          <span className="mr-0.5 text-[0.92em]">{node.fig}</span>
          {node.san}
          {node.sym ? (
            <span className="ml-0.5 font-bold text-score-red">{node.sym}</span>
          ) : null}
        </span>
      )}
    </button>
  );
}
