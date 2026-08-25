import { OPENING_NODES, ROOT_ID } from "@/content/opening";
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

export function collectPlies(id: string): Ply[] {
  return getPath(id).flatMap((n) => n.plies);
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
  mainY: number;
};

/** Horizontal pitch of mainline moves. Sized for 44px targets with air between. */
const COL = 92;
const PAD_X = 36;
const PAD_Y = 20;
const LANE = 56;

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
 * Score layout, not a flowchart.
 * Mainline is one horizontal row. Life hangs off the parent above;
 * variations and not-taken hang off the parent below.
 */
export function layoutTree(nodes: OpeningNode[] = OPENING_NODES): TreeLayout {
  const mainline = mainlineOf(nodes);
  const maxUp = Math.max(
    1,
    ...mainline.map((n) => kidsOf(nodes, n.id).filter((c) => c.type === "life").length),
  );
  const maxDown = Math.max(
    1,
    ...mainline.map(
      (n) =>
        kidsOf(nodes, n.id).filter((c) => c.type === "variation" || c.type === "not-taken").length,
    ),
  );

  const mainY = PAD_Y + maxUp * LANE;
  const positions: Record<string, Point> = {};

  mainline.forEach((n, i) => {
    positions[n.id] = { x: PAD_X + i * COL, y: mainY };
  });

  for (const parent of mainline) {
    const origin = positions[parent.id];
    const kids = kidsOf(nodes, parent.id);
    kids
      .filter((n) => n.type === "life")
      .forEach((n, i) => {
        positions[n.id] = { x: origin.x, y: mainY - LANE * (i + 1) };
      });
    kids
      .filter((n) => n.type === "variation" || n.type === "not-taken")
      .forEach((n, i) => {
        positions[n.id] = { x: origin.x, y: mainY + LANE * (i + 1) };
      });
  }

  return {
    width: PAD_X + Math.max(0, mainline.length - 1) * COL + 48,
    height: mainY + maxDown * LANE + PAD_Y,
    positions,
    mainY,
  };
}

export { OPENING_NODES, ROOT_ID };
