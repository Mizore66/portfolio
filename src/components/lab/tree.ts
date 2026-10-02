/**
 * The opening's search tree (key frame lab-a; motion.md §5), drawn from the kept engine's own candidate lines
 * (content/lab-tree.json, src/content/lab-tree.gen.ts). The layout is design/keyframes/_shared/tree.js: each line
 * leaves its parent at an angle that narrows with depth, a little seeded jitter keeps it from reading as a diagram,
 * and the principal variation (every node's best reply) is drawn in amber.
 */
import type { TreeNode } from "@/content/lab-tree.gen";

export interface Line { x1: number; y1: number; x2: number; y2: number; depth: number; remaining: number }

export function layout(root: TreeNode, { x, y, len, bounds, dir = 0 }: { x: number; y: number; len: number; bounds: [number, number, number, number]; dir?: number }) {
  let s = 19; const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const lines: Line[] = [], pv: [number, number][] = [[x, y]];
  const DEPTH = 9;
  (function grow(node: TreeNode, x0: number, y0: number, a: number, l: number, d: number, isPv: boolean) {
    // the best reply (children[0]) is drawn in the middle of its siblings, so the principal variation runs on
    // through the tree rather than along its edge; with two, it alternates sides depth by depth
    const n = node.children.length, mid = n === 3 ? 1 : n === 2 ? d % 2 : 0;
    if (!n) return;
    const order = node.children.slice(1); order.splice(mid, 0, node.children[0]);
    order.forEach((c, i) => {
      const sp = d < 2 ? 0.7 : d < 5 ? 0.48 : 0.34;
      const b = a + (i - (n - 1) / 2) * sp + (rnd() - 0.5) * 0.2, x2 = x0 + l * Math.cos(b), y2 = y0 + l * Math.sin(b);
      if (x2 < bounds[0] || y2 < bounds[1] || x2 > bounds[2] || y2 > bounds[3]) return;
      const onPv = isPv && c === node.children[0];
      if (onPv) pv.push([x2, y2]); else lines.push({ x1: x0, y1: y0, x2, y2, depth: d, remaining: DEPTH - d });
      grow(c, x2, y2, b, l * (0.78 + rnd() * 0.1), d + 1, onPv);
    });
  })(root, x, y, dir, len, 0, true);
  return { lines, pv };
}
