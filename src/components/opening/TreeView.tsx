"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  isSingleMainlineAdvance,
  layoutTree,
  OPENING_NODES,
  pathIdSet,
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
  onPreview,
  tape = false,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
  onPreview?: (id: string | null) => void;
  tape?: boolean;
}) {
  const layout = useMemo(() => layoutTree(), []);
  const onPath = useMemo(() => pathIdSet(selectedId), [selectedId]);
  const prevId = useRef(selectedId);
  const skipScroll = useRef(true);
  const [inkEdge, setInkEdge] = useState<string | null>(null);

  useEffect(() => {
    const prev = prevId.current;
    prevId.current = selectedId;
    if (isSingleMainlineAdvance(prev, selectedId)) {
      setInkEdge(`${prev}-${selectedId}`);
    } else {
      setInkEdge(null);
    }
  }, [selectedId]);

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false;
      return;
    }
    const el = document.querySelector(
      `[data-testid="tree-view"] [data-node-id="${CSS.escape(selectedId)}"]`,
    );
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selectedId]);

  return (
    <div className="relative px-2 py-2 sm:px-3" data-testid="tree-view">
      <div className="overflow-auto">
        <div
          className="relative mx-auto"
          style={{ width: layout.width, height: layout.height }}
        >
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
              const edgeId = `${n.parent}-${n.id}`;
              return (
                <TreeEdge
                  key={edgeId}
                  child={n}
                  from={from}
                  to={to}
                  onPath={onPath.has(n.id)}
                  ink={inkEdge === edgeId}
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
                tape={tape}
                onSelect={onSelect}
                onPreview={onPreview}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TreeEdge({
  child,
  from,
  to,
  onPath,
  ink,
}: {
  child: OpeningNode;
  from: Point;
  to: Point;
  onPath: boolean;
  ink: boolean;
}) {
  const ref = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  const d = branchPath(from, to);

  useLayoutEffect(() => {
    if (ref.current) setLen(ref.current.getTotalLength());
  }, [d]);

  const dashed = child.type === "not-taken";
  const stroke =
    child.type === "life" ? "#1e3a72" : child.type === "mainline" ? "#1a120c" : "#4a3f34";
  const width = onPath
    ? child.type === "mainline"
      ? 2.2
      : 1.45
    : child.type === "mainline"
      ? 1.6
      : 1.15;

  return (
    <path
      ref={ref}
      data-edge={`${child.parent}-${child.id}`}
      data-on-path={onPath ? "true" : "false"}
      data-ink={ink ? "true" : "false"}
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={width}
      strokeDasharray={ink && len ? undefined : dashed ? "4 3" : undefined}
      className={cn(
        "tree-edge",
        !onPath && "tree-edge-dim",
        dashed && "tree-edge-dashed",
        ink && len > 0 && "tree-edge-ink",
      )}
      style={ink && len > 0 ? ({ ["--path-len"]: `${len}` } as CSSProperties) : undefined}
    />
  );
}

function TreeNode({
  node,
  x,
  y,
  selected,
  tape,
  onSelect,
  onPreview,
}: {
  node: OpeningNode;
  x: number;
  y: number;
  selected: boolean;
  tape: boolean;
  onSelect: (id: string) => void;
  onPreview?: (id: string | null) => void;
}) {
  const label = node.moveNumber === 0 ? "start" : node.san;
  const clipping = tape && node.type === "life";
  const tilt = node.id.charCodeAt(0) % 2 === 0 ? -1.4 : 1.2;

  return (
    <button
      type="button"
      data-node-id={node.id}
      data-life-clip={clipping ? "true" : undefined}
      aria-current={selected ? "true" : undefined}
      aria-label={`${label} ${node.sym} ${node.title}`.trim()}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => onPreview?.(node.id)}
      onMouseLeave={() => onPreview?.(null)}
      onFocus={() => onPreview?.(node.id)}
      onBlur={() => onPreview?.(null)}
      style={{
        left: x,
        top: y,
        ...(clipping ? { transform: `translate(-50%, -50%) rotate(${tilt}deg)` } : {}),
      }}
      className={cn(
        "absolute z-10 flex w-[140px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-1 py-1 text-center",
        "font-display tracking-tight transition-colors",
        "hover:text-score-red",
        node.type === "mainline" && "text-book-blue",
        node.type === "life" && "text-book-blue",
        node.type === "variation" && "italic text-ink",
        node.type === "not-taken" && "border border-dashed border-ink italic text-ink",
        clipping && "tree-life-clip",
        selected && "z-20 bg-paper text-score-red not-italic outline outline-2 outline-score-red",
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
      <span className="mt-0.5 line-clamp-1 font-lora text-[11px] font-normal not-italic leading-tight text-ink">
        {node.title}
      </span>
    </button>
  );
}
