/** Vintage patent ink: three weights, shade lines, 45° section cuts. */

export const W = {
  outline: 1.75,
  detail: 0.95,
  shade: 0.36,
} as const;

export function pt(n: number) {
  return Number(n.toFixed(2));
}

export type Box = { x: number; y: number; w: number; h: number };

export function cx(b: Box) {
  return b.x + b.w / 2;
}
export function cy(b: Box) {
  return b.y + b.h / 2;
}

export const outline = {
  fill: "none" as const,
  stroke: "var(--ink)",
  strokeWidth: W.outline,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const detail = {
  fill: "none" as const,
  stroke: "var(--ink)",
  strokeWidth: W.detail,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const shade = {
  fill: "none" as const,
  stroke: "var(--ink)",
  strokeWidth: W.shade,
  strokeLinecap: "butt" as const,
};

/** Vertical shade strokes on the right (shadow) half of a true circle. Light from upper-left. */
export function shadeDisk(cx0: number, cy0: number, r: number) {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const n = Math.max(7, Math.round(r / 1.55));
  for (let i = 1; i <= n; i++) {
    const t = i / (n + 1);
    const x = pt(cx0 + r * (0.08 + 0.82 * t));
    const dx = x - cx0;
    const h = Math.sqrt(Math.max(0, r * r - dx * dx));
    const y1 = pt(cy0 - h * (0.55 - 0.35 * t));
    const y2 = pt(cy0 + h * 0.96);
    if (y2 - y1 > 1.2) lines.push({ x1: x, y1, x2: x, y2 });
  }
  return lines;
}

/** Horizontal-cylinder shade: short vertical strokes along the lower-right of the barrel. */
export function shadeBarrel(x: number, y: number, w: number, h: number) {
  const lines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  const n = Math.max(10, Math.round(w / 5.5));
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const xx = pt(x + w * (0.35 + 0.6 * t));
    const top = y + h * 0.42;
    const bot = y + h * 0.92;
    const len = (bot - top) * (0.45 + 0.55 * t);
    lines.push({ x1: xx, y1: pt(bot - len), x2: xx, y2: pt(bot) });
  }
  return lines;
}

export function rivets(x: number, y: number, count: number, dx: number, r = 1.05) {
  return Array.from({ length: count }, (_, i) => ({
    cx: pt(x + i * dx),
    cy: pt(y),
    r,
  }));
}

/** Coil spring, drawn coil-by-coil. Vertical axis at x, from y1 to y2. */
export function coilSpring(x: number, y1: number, y2: number, coils = 7, amp = 5.5) {
  const h = y2 - y1;
  const steps: string[] = [`M${pt(x)} ${pt(y1)}`];
  for (let i = 0; i < coils; i++) {
    const yMid = y1 + (h * (i + 0.5)) / coils;
    const yEnd = y1 + (h * (i + 1)) / coils;
    const side = i % 2 === 0 ? amp : -amp;
    steps.push(`Q${pt(x + side)} ${pt(yMid)} ${pt(x)} ${pt(yEnd)}`);
  }
  return steps.join(" ");
}

export function spokes(
  cx0: number,
  cy0: number,
  inner: number,
  outer: number,
  count: number,
  start = 0,
) {
  return Array.from({ length: count }, (_, i) => {
    const a = start + (i * Math.PI * 2) / count;
    return {
      x1: pt(cx0 + Math.cos(a) * inner),
      y1: pt(cy0 + Math.sin(a) * inner),
      x2: pt(cx0 + Math.cos(a) * outer),
      y2: pt(cy0 + Math.sin(a) * outer),
    };
  });
}

export function ShadeLines({
  lines,
}: {
  lines: { x1: number; y1: number; x2: number; y2: number }[];
}) {
  return (
    <g {...shade}>
      {lines.map((l, i) => (
        <line key={i} {...l} />
      ))}
    </g>
  );
}

export function SectionHatch({ hatchId }: { hatchId: string }) {
  return (
    <pattern
      id={hatchId}
      patternUnits="userSpaceOnUse"
      width="4"
      height="4"
      patternTransform="rotate(45)"
    >
      <line x1="0" y1="0" x2="0" y2="4" stroke="var(--ink)" strokeWidth="0.7" />
    </pattern>
  );
}

export function Rivets({
  x,
  y,
  count,
  dx,
  r = 1.05,
}: {
  x: number;
  y: number;
  count: number;
  dx: number;
  r?: number;
}) {
  return (
    <g fill="none" stroke="var(--ink)" strokeWidth={W.detail}>
      {rivets(x, y, count, dx, r).map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} />
      ))}
    </g>
  );
}
