import { ENGINE_NODE_ID, FLAGSHIP_ID, OPENING_NODES, ROOT_ID } from "@/content/opening";
import type { OpeningNode, Ply } from "@/lib/opening/types";

const byId: Record<string, OpeningNode> = Object.fromEntries(
  OPENING_NODES.map((n) => [n.id, n]),
);

const childrenOf: Record<string, OpeningNode[]> = {};
for (const node of OPENING_NODES) {
  const key = node.parent ?? ROOT_ID;
  if (node.parent === null) continue;
  (childrenOf[key] ??= []).push(node);
}

export function getNode(id: string): OpeningNode {
  const node = byId[id];
  if (!node) throw new Error(`Unknown opening node: ${id}`);
  return node;
}

export function isOpeningId(id: string): boolean {
  return id in byId;
}

export function getRoot(): OpeningNode {
  return getNode(ROOT_ID);
}

export function getChildren(id: string): OpeningNode[] {
  return childrenOf[id] ?? [];
}

export function getPath(id: string): OpeningNode[] {
  const path: OpeningNode[] = [];
  let current: OpeningNode | undefined = getNode(id);
  while (current) {
    path.push(current);
    current = current.parent ? byId[current.parent] : undefined;
  }
  return path.reverse();
}

export function pathIdSet(id: string): Set<string> {
  return new Set(getPath(id).map((n) => n.id));
}

/** True when `toId` is the mainline child of `fromId` — one trunk ply, not a jump. */
export function isSingleMainlineAdvance(fromId: string, toId: string): boolean {
  if (fromId === toId) return false;
  const to = getNode(toId);
  return to.type === "mainline" && to.parent === fromId;
}

export function collectPlies(id: string): Ply[] {
  return getPath(id).flatMap((n) => n.plies);
}

export function lastPly(id: string): Ply | null {
  const plies = collectPlies(id);
  return plies[plies.length - 1] ?? null;
}

export function sideToMove(id: string): "w" | "b" {
  const node = getNode(id);
  if (!node.color) return "w";
  return node.color === "w" ? "b" : "w";
}

export function getMainline(): OpeningNode[] {
  const line: OpeningNode[] = [];
  let current: OpeningNode | undefined = getRoot();
  while (current) {
    line.push(current);
    current = getChildren(current.id).find((n) => n.type === "mainline");
  }
  return line;
}

/** White's six trunk moves — the sticky-rail contents list. */
export function issueChapters(): OpeningNode[] {
  return getMainline().filter((n) => n.color === "w");
}

/** Next annotated ply on the trunk — the tiny book so the glass case does not advertise 1.Nc3. */
export function nextMainlineBook(id: string): { san: string; plies: Ply[] } | null {
  const next = getChildren(id).find((n) => n.type === "mainline");
  if (!next || next.plies.length === 0) return null;
  return { san: next.san, plies: next.plies };
}

/** Nearest mainline node on the path (the node itself if it is mainline). */
export function mainlineAnchor(id: string): OpeningNode {
  const path = getPath(id);
  for (let i = path.length - 1; i >= 0; i--) {
    if (path[i].type === "mainline") return path[i];
  }
  return getRoot();
}

export function stepMainline(selectedId: string, delta: number): string {
  const line = getMainline();
  const anchor = mainlineAnchor(selectedId);
  const idx = line.findIndex((n) => n.id === anchor.id);
  const next = Math.max(0, Math.min(line.length - 1, idx + delta));
  return line[next].id;
}

export function formatLine(id: string): string {
  const parts: string[] = [];
  for (const n of getPath(id)) {
    if (!n.color || n.moveNumber === 0) continue;
    const glyph = n.sym ? `${n.san}${n.sym}` : n.san;
    if (n.color === "w") {
      parts.push(`${n.moveNumber}. ${glyph}`);
    } else if (parts.length === 0) {
      parts.push(`${n.moveNumber}…${glyph}`);
    } else {
      parts.push(glyph);
    }
  }
  return parts.join(" ") || "Start";
}

export function moveHeading(node: OpeningNode): string {
  if (!node.color || node.moveNumber === 0) return node.san;
  if (node.color === "w") return `${node.moveNumber}. ${node.san}`;
  return `${node.moveNumber}…${node.san}`;
}

export type NotationBlock = {
  node: OpeningNode;
  variationStart: boolean;
  variations: NotationBlock[][];
};

function variationLine(start: OpeningNode): NotationBlock[] {
  const line: NotationBlock[] = [
    {
      node: start,
      variationStart: true,
      variations: [],
    },
  ];
  let current = start;
  while (true) {
    const kids = getChildren(current.id);
    const cont =
      kids.find((n) => n.type === current.type) ??
      kids.find((n) => n.type !== "mainline" && kids.length === 1);
    const nested = kids.filter((n) => n !== cont);
    line[line.length - 1].variations = nested.map((n) => variationLine(n));
    if (!cont) break;
    current = cont;
    line.push({ node: current, variationStart: false, variations: [] });
  }
  return line;
}

export function buildNotation(): NotationBlock[] {
  const line: NotationBlock[] = [];
  for (const node of getMainline()) {
    const variations = getChildren(node.id)
      .filter((n) => n.type !== "mainline")
      .map((n) => variationLine(n));
    line.push({
      node,
      variationStart: false,
      variations,
    });
  }
  return line;
}

export type Point = { x: number; y: number };

export type TreeLayout = {
  width: number;
  height: number;
  positions: Record<string, Point>;
  trunkX: number;
};

/** Tight enough that three columns fit a newspaper page without a horizontal scroll. */
export const TREE_NODE_W = 108;
const COL = 116;
const ROW = 64;
const PAD_X = TREE_NODE_W / 2 + 6;
const PAD_Y = 28;

function mainlineOf(nodes: OpeningNode[]): OpeningNode[] {
  const line: OpeningNode[] = [];
  let current = nodes.find((n) => n.parent === null && n.type === "mainline");
  while (current) {
    line.push(current);
    const parentId = current.id;
    current = nodes.find((n) => n.parent === parentId && n.type === "mainline");
  }
  return line;
}

function kidsOf(nodes: OpeningNode[], parentId: string): OpeningNode[] {
  return nodes.filter((n) => n.parent === parentId);
}

/**
 * Top-down repertoire tree.
 * Trunk is the mainline. Variations and declined lines fork right,
 * sitting on the same rank as the next mainline ply.
 */
export function layoutTree(nodes: OpeningNode[] = OPENING_NODES): TreeLayout {
  const mainline = mainlineOf(nodes);
  const maxLeft = 0;
  let maxRight = 1;
  for (const n of mainline) {
    const kids = kidsOf(nodes, n.id);
    maxRight = Math.max(
      maxRight,
      kids.filter((c) => c.type === "variation" || c.type === "not-taken").length,
    );
  }

  const trunkX = PAD_X + maxLeft * COL;
  const positions: Record<string, Point> = {};

  mainline.forEach((n, i) => {
    positions[n.id] = { x: trunkX, y: PAD_Y + i * ROW };
  });

  mainline.forEach((parent) => {
    const origin = positions[parent.id];
    const childY = origin.y + ROW;
    const kids = kidsOf(nodes, parent.id);
    kids
      .filter((n) => n.type === "variation" || n.type === "not-taken")
      .forEach((n, j) => {
        positions[n.id] = { x: trunkX + COL * (j + 1), y: childY };
      });
  });

  return {
    width: trunkX + maxRight * COL + PAD_X,
    height: PAD_Y + Math.max(0, mainline.length - 1) * ROW + PAD_Y,
    positions,
    trunkX,
  };
}

/** The scoresheet node that carries today's diagram quiz — never a lock. */
export function todaysPuzzle(): OpeningNode | null {
  return OPENING_NODES.find((n) => n.puzzle) ?? null;
}

export { ENGINE_NODE_ID, FLAGSHIP_ID, OPENING_NODES, ROOT_ID };
