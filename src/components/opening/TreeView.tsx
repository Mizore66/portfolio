"use client";

import { useMemo } from "react";
import {
  getMainline,
  getNode,
  layoutTree,
  moveHeading,
  OPENING_NODES,
  type Point,
} from "@/lib/opening/tree";
import type { OpeningNode } from "@/lib/opening/types";
import { cn } from "@/lib/utils";

const STEM_INSET = 18;
const RUN_INSET = 28;

function stem(from: Point, to: Point) {
  const dir = to.y > from.y ? 1 : -1;
  return `M ${from.x} ${from.y + dir * STEM_INSET} V ${to.y - dir * STEM_INSET}`;
}

function run(from: Point, to: Point) {
  return `M ${from.x + RUN_INSET} ${from.y} H ${to.x - RUN_INSET}`;
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
  const mainPts = mainline.map((n) => layout.positions[n.id]).filter(Boolean);

  return (
    <div className="relative px-4 py-5 sm:px-6" data-testid="tree-view">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-faded">
        Life above · the mainline · variations below · dashed = not taken
      </p>

      <div className="overflow-x-auto">
        <div
          className="relative"
          style={{ width: layout.width, height: layout.height }}
        >
          <svg
            aria-hidden
            className="pointer-events-none absolute inset-0"
            width={layout.width}
            height={layout.height}
          >
            {mainPts.slice(0, -1).map((from, i) => {
              const to = mainPts[i + 1];
              if (!to) return null;
              return (
                <path
                  key={`run-${i}`}
                  d={run(from, to)}
                  fill="none"
                  stroke="#1d1a14"
                  strokeWidth="1"
                  opacity="0.35"
                />
              );
            })}
            {OPENING_NODES.filter((n) => n.parent && n.type !== "mainline").map((n) => {
              const from = layout.positions[n.parent!];
              const to = layout.positions[n.id];
              if (!from || !to) return null;
              const dashed = n.type === "not-taken";
              return (
                <path
                  key={`${n.parent}-${n.id}`}
                  d={stem(from, to)}
                  fill="none"
                  stroke={n.type === "life" ? "#25457f" : "#8d8574"}
                  strokeWidth="1"
                  strokeDasharray={dashed ? "3 3" : undefined}
                  opacity={dashed ? 0.55 : 0.7}
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
        className="mt-5 max-w-2xl font-display text-[18px] leading-snug text-ink"
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
        "absolute z-10 flex h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-1.5",
        "font-display tracking-tight transition-colors",
        "hover:text-score-red",
        node.type === "mainline" && "text-[15px] font-semibold text-book-blue",
        node.type === "life" && "text-[13px] text-book-blue",
        node.type === "variation" && "text-[13px] italic text-ink/80",
        node.type === "not-taken" && "text-[13px] italic text-ink/55",
        selected && "z-20 text-score-red not-italic",
      )}
    >
      {node.color === "w" && node.moveNumber > 0 ? (
        <span className="font-mono text-[9px] font-normal not-italic leading-none text-faded">
          {node.moveNumber}.
        </span>
      ) : null}
      {node.moveNumber === 0 ? (
        <span className="relative font-mono text-[10px] uppercase tracking-widest">
          {label}
          {selected ? (
            <span aria-hidden className="absolute inset-x-0 -bottom-1.5 h-0.5 bg-score-red" />
          ) : null}
        </span>
      ) : (
        <span className="relative leading-none">
          <span className="mr-0.5 text-[0.92em] not-italic">{node.fig}</span>
          {node.san}
          {node.sym ? (
            <span
              className={cn(
                "ml-0.5 font-bold not-italic",
                node.type === "not-taken" ? "text-ink/55" : "text-score-red",
              )}
            >
              {node.sym}
            </span>
          ) : null}
          {selected ? (
            <span
              aria-hidden
              className="absolute inset-x-0 -bottom-1.5 h-0.5 bg-score-red"
            />
          ) : null}
        </span>
      )}
    </button>
  );
}
