import type { ReactNode } from "react";
import type { ApparatusPart, GlyphId } from "@/lib/opening/types";
import {
  type Box,
  Rivets,
  ShadeLines,
  W,
  cx,
  cy,
  detail,
  outline,
  pt,
  coilSpring,
  shadeBarrel,
  shadeDisk,
  spokes,
} from "@/components/opening/patent-ink";

type Opt = { dusty?: boolean; idle?: boolean; slack?: boolean; section?: boolean; hatchId?: string };

function Millwheel(b: Box, o?: Opt) {
  const x = cx(b);
  const y = cy(b) - 2;
  const r = Math.min(b.w, b.h) / 2 - 4;
  const hub = r * 0.18;
  const rimIn = r * 0.82;
  return (
    <g data-glyph="millwheel">
      <circle cx={x} cy={y} r={r} {...outline} />
      <circle cx={x} cy={y} r={rimIn} {...detail} />
      <circle cx={x} cy={y} r={r * 0.94} {...detail} />
      <g {...detail}>
        {spokes(x, y, hub + 2, rimIn - 1, 16).map((s, i) => (
          <line key={i} {...s} />
        ))}
      </g>
      <circle cx={x} cy={y} r={hub} {...outline} />
      <circle cx={x} cy={y} r={hub * 0.4} {...detail} />
      {spokes(x, y, hub * 0.45, hub - 1.2, 6).map((s, i) => (
        <line key={`b${i}`} {...s} {...detail} />
      ))}
      <ShadeLines lines={shadeDisk(x, y, r)} />
      <line x1={x + r} y1={y} x2={b.x + b.w - 2} y2={y} {...outline} />
      <rect x={b.x + b.w - 12} y={y - 7} width={10} height={14} {...outline} />
      <Rivets x={b.x + b.w - 7} y={y - 3} count={3} dx={0} r={0.8} />
      <line x1={b.x + 4} y1={b.y + b.h - 3} x2={b.x + b.w - 4} y2={b.y + b.h - 3} {...detail} />
      {o?.idle ? (
        <g {...detail} opacity="0.55">
          <path d={`M${pt(x + r * 0.2)} ${pt(y - r * 0.75)} L${pt(x + r * 0.55)} ${pt(y - r * 0.45)} L${pt(x + r * 0.35)} ${pt(y - r * 0.2)}`} />
          <path d={`M${pt(x + r * 0.3)} ${pt(y - r * 0.7)} L${pt(x + r * 0.5)} ${pt(y - r * 0.35)}`} />
        </g>
      ) : null}
      <path d={coilSpring(x - r * 0.4, y + r - 1, b.y + b.h - 3, 6, 3.6)} {...detail} />
      <path d={coilSpring(x + r * 0.4, y + r - 1, b.y + b.h - 3, 6, 3.6)} {...detail} />
      <rect x={x - 8} y={y + r - 2} width={16} height={7} {...outline} />
    </g>
  );
}

function Boiler(b: Box) {
  const x = b.x + 6;
  const y = b.y + b.h * 0.32;
  const w = b.w - 14;
  const h = b.h * 0.5;
  const ry = h / 2;
  const chimX = x + w * 0.72;
  const chimW = Math.max(10, w * 0.1);
  return (
    <g data-glyph="boiler">
      <rect x={chimX} y={b.y + 4} width={chimW} height={y - b.y} {...outline} />
      <line x1={chimX} y1={b.y + 10} x2={chimX + chimW} y2={b.y + 10} {...detail} />
      <line x1={chimX} y1={b.y + 18} x2={chimX + chimW} y2={b.y + 18} {...detail} />
      <path d={`M${chimX + 1} ${b.y + 4} Q${chimX + chimW / 2} ${b.y - 2} ${chimX + chimW - 1} ${b.y + 5}`} {...detail} />
      <ellipse cx={x} cy={y + ry} rx={ry * 0.45} ry={ry} {...outline} />
      <rect x={x} y={y} width={w} height={h} {...outline} />
      <ellipse cx={x + w} cy={y + ry} rx={ry * 0.45} ry={ry} {...outline} />
      <ShadeLines lines={shadeBarrel(x + 8, y, w - 10, h)} />
      <Rivets x={x + 18} y={y + 5} count={Math.max(5, Math.round(w / 16))} dx={14} />
      <circle cx={x + 22} cy={y + ry} r={Math.min(8, h * 0.22)} {...outline} />
      <circle cx={x + 22} cy={y + ry} r={3} {...detail} />
      <line x1={x + 8} y1={y + h} x2={x + 8} y2={b.y + b.h - 2} {...outline} />
      <line x1={x + w - 10} y1={y + h} x2={x + w - 10} y2={b.y + b.h - 2} {...outline} />
      <line x1={x} y1={b.y + b.h - 2} x2={x + w} y2={b.y + b.h - 2} {...detail} />
      <Rivets x={x + 8} y={b.y + b.h - 6} count={2} dx={w - 18} r={1.2} />
    </g>
  );
}

function Belt(b: Box, o?: Opt) {
  const y = cy(b);
  const r = Math.min(14, b.h * 0.38);
  const left = b.x + r + 2;
  const right = b.x + b.w - r - 2;
  const top = o?.slack
    ? `M${left} ${pt(y - r * 0.72)} Q${pt((left + right) / 2)} ${pt(y - r * 0.2)} ${right} ${pt(y - r * 0.72)}`
    : `M${left} ${pt(y - r * 0.72)} L${right} ${pt(y - r * 0.72)}`;
  const bot = o?.slack
    ? `M${left} ${pt(y + r * 0.72)} Q${pt((left + right) / 2)} ${pt(y + r * 1.35)} ${right} ${pt(y + r * 0.72)}`
    : `M${left} ${pt(y + r * 0.72)} L${right} ${pt(y + r * 0.72)}`;
  return (
    <g data-glyph="belt">
      <circle cx={left} cy={y} r={r} {...outline} />
      <circle cx={right} cy={y} r={r} {...outline} />
      <g {...detail}>
        {spokes(left, y, 2.5, r - 1.5, 10).map((s, i) => (
          <line key={`l${i}`} {...s} />
        ))}
        {spokes(right, y, 2.5, r - 1.5, 10).map((s, i) => (
          <line key={`r${i}`} {...s} />
        ))}
      </g>
      <circle cx={left} cy={y} r={2.2} {...outline} />
      <circle cx={right} cy={y} r={2.2} {...outline} />
      <path d={top} {...outline} />
      <path d={bot} {...outline} />
      <ShadeLines lines={[...shadeDisk(left, y, r), ...shadeDisk(right, y, r)]} />
    </g>
  );
}

function Hopper(b: Box) {
  const top = b.y + 3;
  const bot = b.y + b.h - 8;
  const mouth = b.w * 0.22;
  return (
    <g data-glyph="hopper">
      <path
        d={`M${b.x + 3} ${top} H${b.x + b.w - 3} L${b.x + b.w / 2 + mouth} ${bot} H${b.x + b.w / 2 - mouth} Z`}
        {...outline}
      />
      <line x1={b.x + 10} y1={top + 6} x2={b.x + b.w - 10} y2={top + 6} {...detail} />
      <rect x={b.x + b.w / 2 - mouth} y={bot} width={mouth * 2} height={6} {...outline} />
      <Rivets x={b.x + 12} y={top + 3} count={5} dx={(b.w - 28) / 4} />
      <ShadeLines
        lines={Array.from({ length: 6 }, (_, i) => ({
          x1: pt(b.x + b.w * 0.62 + i * 3.2),
          y1: pt(top + 10 + i * 4),
          x2: pt(b.x + b.w * 0.62 + i * 3.2),
          y2: pt(bot - 8 + i * 2),
        }))}
      />
    </g>
  );
}

function Funnel(b: Box, o?: Opt) {
  const mid = b.y + b.h * 0.48;
  return (
    <g data-glyph="funnel" opacity={o?.idle ? 0.5 : 1}>
      <path
        d={`M${b.x + 4} ${b.y + 3} H${b.x + b.w - 4} L${b.x + b.w * 0.58} ${mid} H${b.x + b.w * 0.42} Z`}
        {...outline}
      />
      <rect x={b.x + b.w * 0.42} y={mid} width={b.w * 0.16} height={b.h * 0.46} {...outline} />
      <ShadeLines
        lines={Array.from({ length: 5 }, (_, i) => ({
          x1: pt(b.x + b.w * 0.55 + i * 2.4),
          y1: pt(b.y + 8 + i * 3),
          x2: pt(b.x + b.w * 0.55 + i * 2.4),
          y2: pt(mid - 4),
        }))}
      />
    </g>
  );
}

function Valve(b: Box) {
  const x = cx(b);
  const y = b.y + b.h * 0.38;
  const r = Math.min(b.w, b.h) * 0.28;
  return (
    <g data-glyph="valve">
      <rect x={b.x + 4} y={b.y + b.h * 0.62} width={b.w - 8} height={b.h * 0.22} {...outline} />
      <circle cx={x} cy={y} r={r} {...outline} />
      {spokes(x, y, 2, r - 1, 8).map((s, i) => (
        <line key={i} {...s} {...detail} />
      ))}
      <circle cx={x} cy={y} r={2.2} {...outline} />
      <line x1={x} y1={y + r} x2={x} y2={b.y + b.h * 0.62} {...outline} />
      <ShadeLines lines={shadeDisk(x, y, r)} />
      <Rivets x={b.x + 8} y={b.y + b.h * 0.73} count={4} dx={(b.w - 20) / 3} r={0.9} />
    </g>
  );
}

function Tube(b: Box, o?: Opt) {
  const y = cy(b);
  const h = Math.min(b.h * 0.62, 42);
  const x1 = b.x + 8;
  const x2 = b.x + b.w - 8;
  const top = y - h / 2;
  const bot = y + h / 2;
  const cutL = x1 + (x2 - x1) * 0.38;
  const cutR = x1 + (x2 - x1) * 0.62;
  const hatch = o?.hatchId;
  const flanges = [];
  for (let x = x1 + 24; x < x2 - 16; x += 56) flanges.push(pt(x));
  const capX = (cutL + cutR) / 2;
  const capRx = Math.min(18, (cutR - cutL) * 0.32);
  const capRy = h * 0.28;
  return (
    <g data-glyph="tube">
      <line x1={x1} y1={top} x2={x2} y2={top} {...outline} />
      <line x1={x1} y1={bot} x2={x2} y2={bot} {...outline} />
      <line x1={x1} y1={top + 3.2} x2={x2} y2={top + 3.2} {...detail} />
      <line x1={x1} y1={bot - 3.2} x2={x2} y2={bot - 3.2} {...detail} />
      <ellipse cx={x1} cy={y} rx={7} ry={h / 2} {...outline} />
      <ellipse cx={x1} cy={y} rx={4} ry={h / 2 - 4} {...detail} />
      <ellipse cx={x2} cy={y} rx={7} ry={h / 2} {...outline} />
      {flanges.map((x) => (
        <g key={x}>
          <line x1={x} y1={top - 4} x2={x} y2={bot + 4} {...detail} />
          <ellipse cx={x} cy={y} rx={3.2} ry={h / 2 + 4} {...detail} />
          <circle cx={x} cy={top - 3} r={1} {...detail} />
          <circle cx={x} cy={bot + 3} r={1} {...detail} />
        </g>
      ))}
      {o?.section && hatch ? (
        <rect x={x1} y={top} width={x2 - x1} height={h} fill={`url(#${hatch})`} stroke="none" opacity="0.85" />
      ) : hatch ? (
        <>
          <path d={`M${cutL} ${top} Q${pt(capX)} ${pt(top - 8)} ${cutR} ${top}`} {...detail} />
          <path d={`M${cutL} ${bot} Q${pt(capX)} ${pt(bot + 8)} ${cutR} ${bot}`} {...detail} />
          <rect x={cutL} y={top} width={cutR - cutL} height={h} fill={`url(#${hatch})`} stroke="none" opacity="0.45" />
        </>
      ) : null}
      <ellipse cx={pt(capX)} cy={y} rx={pt(capRx)} ry={pt(capRy)} {...outline} />
      <ellipse cx={pt(capX - capRx * 0.35)} cy={y} rx={pt(capRx * 0.22)} ry={pt(capRy * 0.7)} {...detail} />
      <ShadeLines lines={shadeBarrel(x1, top, x2 - x1, h)} />
      <line x1={x1 + 16} y1={bot} x2={x1 + 16} y2={b.y + b.h - 2} {...detail} />
      <line x1={x2 - 16} y1={bot} x2={x2 - 16} y2={b.y + b.h - 2} {...detail} />
      <rect x={x1 + 10} y={b.y + b.h - 8} width={12} height={6} {...detail} />
      <rect x={x2 - 22} y={b.y + b.h - 8} width={12} height={6} {...detail} />
    </g>
  );
}

function Capsule(b: Box) {
  const r = Math.min(b.h / 2 - 1, b.w / 4);
  const y = cy(b);
  return (
    <g data-glyph="capsule">
      <rect x={b.x + r} y={y - r} width={b.w - 2 * r} height={2 * r} {...outline} />
      <circle cx={b.x + r} cy={y} r={r} {...outline} />
      <circle cx={b.x + b.w - r} cy={y} r={r} {...outline} />
      <line x1={b.x + r} y1={y - r} x2={b.x + b.w - r} y2={y - r} {...outline} />
      <line x1={b.x + r} y1={y + r} x2={b.x + b.w - r} y2={y + r} {...outline} />
      <ShadeLines lines={shadeBarrel(b.x + 4, y - r, b.w - 8, 2 * r)} />
      <circle cx={b.x + r} cy={y} r={1.4} {...detail} />
    </g>
  );
}

function Gauge(b: Box) {
  const x = cx(b);
  const y = cy(b);
  const r = Math.min(b.w, b.h) / 2 - 2;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = -Math.PI * 0.75 + (i * Math.PI * 1.5) / 11;
    const inner = r * 0.72;
    const outer = r * 0.9;
    return {
      x1: pt(x + Math.cos(a) * inner),
      y1: pt(y + Math.sin(a) * inner),
      x2: pt(x + Math.cos(a) * outer),
      y2: pt(y + Math.sin(a) * outer),
    };
  });
  return (
    <g data-glyph="gauge">
      <circle cx={x} cy={y} r={r} {...outline} />
      <circle cx={x} cy={y} r={r * 0.78} {...detail} />
      <g {...detail}>
        {ticks.map((t, i) => (
          <line key={i} {...t} />
        ))}
      </g>
      <line x1={x} y1={y} x2={pt(x + r * 0.5)} y2={pt(y - r * 0.42)} {...outline} />
      <circle cx={x} cy={y} r={2} fill="var(--ink)" />
      <ShadeLines lines={shadeDisk(x, y, r)} />
      <Rivets x={x - r + 3} y={y - r + 3} count={3} dx={0} r={0.8} />
    </g>
  );
}

function GaugePanel(b: Box) {
  const dials = [0.22, 0.5, 0.78].map((t) => b.x + b.w * t);
  const y = cy(b);
  const r = Math.min(b.h * 0.28, b.w * 0.1);
  return (
    <g data-glyph="gaugepanel">
      <rect x={b.x} y={b.y + 6} width={b.w} height={b.h - 12} {...outline} />
      <line x1={b.x + 6} y1={b.y + 14} x2={b.x + b.w - 6} y2={b.y + 14} {...detail} />
      <Rivets x={b.x + 8} y={b.y + 10} count={8} dx={(b.w - 20) / 7} r={0.9} />
      {dials.map((dx) => (
        <g key={dx}>
          <circle cx={dx} cy={y} r={r} {...outline} />
          <circle cx={dx} cy={y} r={r * 0.72} {...detail} />
          <line x1={dx} y1={y} x2={dx + r * 0.45} y2={y - r * 0.4} {...detail} />
          <ShadeLines lines={shadeDisk(dx, y, r)} />
        </g>
      ))}
    </g>
  );
}

function Roller(b: Box) {
  const y = cy(b);
  const ry = b.h * 0.38;
  const x1 = b.x + 10;
  const x2 = b.x + b.w - 10;
  return (
    <g data-glyph="roller">
      <ellipse cx={x1} cy={y} rx={7} ry={ry} {...outline} />
      <rect x={x1} y={y - ry} width={x2 - x1} height={ry * 2} {...outline} />
      <ellipse cx={x2} cy={y} rx={7} ry={ry} {...outline} />
      <ShadeLines lines={shadeBarrel(x1, y - ry, x2 - x1, ry * 2)} />
      <Rivets x={x1 + 12} y={y - ry + 3} count={6} dx={(x2 - x1 - 20) / 5} />
    </g>
  );
}

function Telegraph(b: Box) {
  const baseY = b.y + b.h * 0.68;
  return (
    <g data-glyph="telegraph">
      <rect x={b.x + 4} y={baseY} width={b.w - 8} height={b.h * 0.26} {...outline} />
      <Rivets x={b.x + 10} y={baseY + 4} count={5} dx={(b.w - 24) / 4} />
      <path d={`M${b.x + 14} ${baseY} V${b.y + b.h * 0.38} L${b.x + b.w * 0.72} ${b.y + b.h * 0.22}`} {...outline} />
      <circle cx={b.x + b.w * 0.72} cy={b.y + b.h * 0.22} r={6} {...outline} />
      <ShadeLines lines={shadeDisk(b.x + b.w * 0.72, b.y + b.h * 0.22, 6)} />
      <rect x={b.x + 12} y={baseY - 8} width={14} height={8} {...detail} />
    </g>
  );
}

function Governor(b: Box, o?: Opt) {
  const x = cx(b);
  const top = b.y + 8;
  const bot = b.y + b.h - 8;
  const mid = top + (bot - top) * 0.32;
  const ballR = Math.min(11, b.w * 0.12);
  const arm = b.w * 0.32;
  const left = x - arm;
  const right = x + arm;
  const ballY = mid + (bot - mid) * 0.35;
  if (o?.section) {
    const r = Math.min(b.w, b.h) / 2 - 4;
    const yy = cy(b);
    return (
      <g data-glyph="governor">
        <circle cx={x} cy={yy} r={r} fill={o.hatchId ? `url(#${o.hatchId})` : "none"} stroke="var(--ink)" strokeWidth={W.outline} />
        <line x1={x} y1={b.y + 6} x2={x} y2={b.y + b.h - 6} {...outline} />
        <rect x={x - 7} y={yy - 10} width={14} height={20} fill="var(--paper)" stroke="var(--ink)" strokeWidth={W.detail} />
        <circle cx={x} cy={yy} r={3.2} fill="var(--paper)" stroke="var(--ink)" strokeWidth={W.detail} />
        <ellipse cx={x - r * 0.55} cy={yy + 6} rx={r * 0.22} ry={r * 0.28} {...outline} />
        <ellipse cx={x + r * 0.55} cy={yy + 6} rx={r * 0.22} ry={r * 0.28} {...outline} />
      </g>
    );
  }
  return (
    <g data-glyph="governor">
      <line x1={x} y1={top} x2={x} y2={bot} {...outline} />
      <rect x={x - 8} y={top} width={16} height={8} {...outline} />
      <Rivets x={x - 5} y={top + 4} count={3} dx={5} r={0.8} />
      <rect x={x - 7} y={mid} width={14} height={18} {...outline} />
      <line x1={x - 7} y1={mid + 6} x2={x + 7} y2={mid + 6} {...detail} />
      <path d={`M${x} ${mid + 4} L${left} ${ballY}`} {...outline} />
      <path d={`M${x} ${mid + 4} L${right} ${ballY}`} {...outline} />
      <path d={`M${left + 4} ${ballY - 6} H${right - 4}`} {...detail} />
      <circle cx={left} cy={ballY} r={ballR} {...outline} />
      <circle cx={right} cy={ballY} r={ballR} {...outline} />
      <ShadeLines lines={[...shadeDisk(left, ballY, ballR), ...shadeDisk(right, ballY, ballR)]} />
      <rect x={x - 11} y={bot - 10} width={22} height={10} {...outline} />
      <line x1={x - 16} y1={bot} x2={x + 16} y2={bot} {...detail} />
      <circle cx={x} cy={mid + 4} r={2.2} {...detail} />
    </g>
  );
}

function Mold(b: Box, o?: Opt) {
  const pad = 6;
  return (
    <g data-glyph="mold">
      <rect x={b.x + pad} y={b.y + 4} width={b.w - pad * 2} height={b.h * 0.72} {...outline} />
      <Rivets x={b.x + pad + 6} y={b.y + 10} count={4} dx={(b.w - pad * 2 - 16) / 3} />
      {/* abstract sort — not a letter */}
      <rect
        x={cx(b) - b.w * 0.12}
        y={b.y + b.h * 0.22}
        width={b.w * 0.24}
        height={b.h * 0.38}
        {...detail}
      />
      <path
        d={`M${cx(b) - 4} ${b.y + b.h * 0.28} h8 v${b.h * 0.12} h-3 v${b.h * 0.14} h-2 v-${b.h * 0.14} h-3 z`}
        {...detail}
      />
      {o?.section && o.hatchId ? (
        <rect
          x={b.x + pad}
          y={b.y + 4}
          width={(b.w - pad * 2) / 2}
          height={b.h * 0.72}
          fill={`url(#${o.hatchId})`}
          stroke="none"
          opacity="0.7"
        />
      ) : null}
      <rect x={b.x + pad + 4} y={b.y + b.h * 0.78} width={b.w - pad * 2 - 8} height={8} {...outline} />
    </g>
  );
}

function Crucible(b: Box) {
  const x = cx(b);
  const rimY = b.y + b.h * 0.22;
  const rx = b.w * 0.38;
  return (
    <g data-glyph="crucible">
      <ellipse cx={x} cy={rimY} rx={rx} ry={8} {...outline} />
      <path
        d={`M${x - rx} ${rimY} L${x - rx * 0.72} ${b.y + b.h - 8} Q${x} ${b.y + b.h} ${x + rx * 0.72} ${b.y + b.h - 8} L${x + rx} ${rimY}`}
        {...outline}
      />
      <ellipse cx={x} cy={rimY} rx={rx * 0.82} ry={5} {...detail} />
      <path
        d={`M${pt(x + rx * 0.78)} ${pt(rimY + 6)} L${pt(b.x + b.w - 2)} ${pt(rimY + 14)} L${pt(b.x + b.w - 2)} ${pt(rimY + 22)} L${pt(x + rx * 0.62)} ${pt(rimY + 18)} Z`}
        {...outline}
      />
      <ShadeLines
        lines={Array.from({ length: 8 }, (_, i) => ({
          x1: pt(x + rx * 0.15 + i * 3.4),
          y1: pt(rimY + 8 + i * 2),
          x2: pt(x + rx * 0.15 + i * 3.4),
          y2: pt(b.y + b.h - 14),
        }))}
      />
    </g>
  );
}

function Typecase(b: Box) {
  const cols = 6;
  const rows = 4;
  const ox = b.x + 6;
  const oy = b.y + 6;
  const cw = (b.w - 12) / cols;
  const rh = (b.h - 12) / rows;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({ x: ox + c * cw, y: oy + r * rh });
    }
  }
  return (
    <g data-glyph="typecase">
      <rect x={b.x} y={b.y} width={b.w} height={b.h} {...outline} />
      {cells.map((cell, i) => (
        <rect key={i} x={cell.x} y={cell.y} width={cw} height={rh} {...detail} />
      ))}
      {cells.slice(0, 5).map((cell, i) => (
        <rect
          key={`s${i}`}
          x={cell.x + cw * 0.3}
          y={cell.y + rh * 0.25}
          width={cw * 0.35}
          height={rh * 0.5}
          {...detail}
        />
      ))}
      <Rivets x={b.x + 5} y={b.y + 3} count={5} dx={(b.w - 14) / 4} r={0.8} />
    </g>
  );
}

function Vault(b: Box) {
  const x = b.x + 6;
  const y = b.y + 4;
  const w = b.w - 12;
  const h = b.h - 8;
  const wx = x + w / 2;
  const wy = y + h * 0.48;
  return (
    <g data-glyph="vault">
      <rect x={x} y={y} width={w} height={h} {...outline} />
      <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} {...detail} />
      <Rivets x={x + 5} y={y + 5} count={6} dx={(w - 10) / 5} />
      <Rivets x={x + 5} y={y + h - 5} count={6} dx={(w - 10) / 5} />
      <circle cx={wx} cy={wy} r={Math.min(16, w * 0.18)} {...outline} />
      {spokes(wx, wy, 3, Math.min(14, w * 0.16), 8).map((s, i) => (
        <line key={i} {...s} {...detail} />
      ))}
      <circle cx={wx} cy={wy} r={3} {...outline} />
      {/* bore — the tube run passes through this station */}
      <ellipse cx={x} cy={wy} rx={5} ry={Math.min(16, h * 0.18)} {...outline} />
      <ellipse cx={x + w} cy={wy} rx={5} ry={Math.min(16, h * 0.18)} {...outline} />
      <ShadeLines lines={shadeDisk(wx, wy, Math.min(16, w * 0.18))} />
    </g>
  );
}

function Seal(b: Box) {
  const x = cx(b);
  return (
    <g data-glyph="seal">
      <rect x={x - 6} y={b.y + 4} width={12} height={b.h * 0.48} {...outline} />
      <rect x={x - 16} y={b.y + 2} width={32} height={8} {...outline} />
      <path d={`M${x} ${b.y + 6} L${b.x + b.w - 8} ${b.y + b.h * 0.28}`} {...outline} />
      <circle cx={b.x + b.w - 10} cy={b.y + b.h * 0.28} r={5} {...outline} />
      <rect x={b.x + 4} y={b.y + b.h * 0.52} width={b.w - 8} height={12} {...outline} />
      <rect x={b.x + 10} y={b.y + b.h * 0.7} width={b.w - 20} height={14} {...outline} />
      <Rivets x={b.x + 12} y={b.y + b.h * 0.58} count={5} dx={(b.w - 28) / 4} />
      <ShadeLines lines={shadeBarrel(b.x + 4, b.y + b.h * 0.52, b.w - 8, 12)} />
    </g>
  );
}

function Key(b: Box) {
  const x = cx(b);
  const r = Math.min(11, b.w * 0.28);
  return (
    <g data-glyph="key">
      <circle cx={x} cy={b.y + r + 4} r={r} {...outline} />
      <circle cx={x} cy={b.y + r + 4} r={r * 0.4} {...detail} />
      <ShadeLines lines={shadeDisk(x, b.y + r + 4, r)} />
      <rect x={x - 3.5} y={b.y + r * 2 + 2} width={7} height={b.h - r * 2 - 10} {...outline} />
      <path
        d={`M${x + 3.5} ${b.y + b.h * 0.62} H${x + 14} V${b.y + b.h * 0.7} H${x + 3.5} M${x + 3.5} ${b.y + b.h * 0.76} H${x + 11} V${b.y + b.h * 0.86} H${x + 3.5}`}
        {...detail}
      />
    </g>
  );
}

function Relay(b: Box) {
  return (
    <g data-glyph="relay">
      <rect x={b.x + 3} y={b.y + 6} width={b.w - 6} height={b.h - 12} {...outline} />
      <rect x={b.x + 10} y={b.y + 14} width={b.w * 0.32} height={b.h * 0.48} {...detail} />
      {Array.from({ length: 6 }, (_, i) => (
        <line
          key={i}
          x1={b.x + 12}
          y1={b.y + 18 + i * 4.2}
          x2={b.x + 10 + b.w * 0.3}
          y2={b.y + 18 + i * 4.2}
          {...detail}
        />
      ))}
      <path
        d={`M${b.x + b.w * 0.48} ${cy(b)} H${b.x + b.w - 12} M${b.x + b.w - 16} ${cy(b) - 8} V${cy(b) + 8}`}
        {...outline}
      />
      <Rivets x={b.x + 8} y={b.y + 9} count={4} dx={(b.w - 20) / 3} r={0.8} />
    </g>
  );
}

function Ledger(b: Box) {
  const x = cx(b);
  return (
    <g data-glyph="ledger">
      <path
        d={`M${b.x + 6} ${b.y + 10} L${x} ${b.y + 4} L${b.x + b.w - 6} ${b.y + 10} V${b.y + b.h - 6} L${x} ${b.y + b.h - 14} L${b.x + 6} ${b.y + b.h - 6} Z`}
        {...outline}
      />
      <path d={`M${x} ${b.y + 4} V${b.y + b.h - 14}`} {...outline} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} {...detail}>
          <line x1={b.x + 12} y1={b.y + 22 + i * 10} x2={x - 6} y2={b.y + 20 + i * 10} />
          <line x1={x + 6} y1={b.y + 20 + i * 10} x2={b.x + b.w - 12} y2={b.y + 22 + i * 10} />
        </g>
      ))}
    </g>
  );
}

const DRAW: Record<GlyphId, (b: Box, o: Opt) => ReactNode> = {
  millwheel: Millwheel,
  boiler: Boiler,
  belt: Belt,
  hopper: Hopper,
  funnel: Funnel,
  valve: Valve,
  tube: Tube,
  capsule: Capsule,
  gauge: Gauge,
  gaugepanel: GaugePanel,
  roller: Roller,
  telegraph: Telegraph,
  governor: Governor,
  mold: Mold,
  crucible: Crucible,
  typecase: Typecase,
  vault: Vault,
  seal: Seal,
  key: Key,
  relay: Relay,
  ledger: Ledger,
};

export function Glyph({
  part,
  hatchId,
}: {
  part: ApparatusPart;
  hatchId: string;
}) {
  const box = { x: part.x ?? 0, y: part.y ?? 0, w: part.w ?? 100, h: part.h ?? 100 };
  return (
    <g data-part={part.n} data-glyph={part.glyph}>
      {DRAW[part.glyph](box, {
        hatchId,
        dusty: part.dusty,
        idle: part.idle,
        slack: part.slack,
        section: part.section,
      })}
    </g>
  );
}

export function Callout({
  mark,
  x,
  y,
  fromX,
  fromY,
}: {
  mark: string;
  x: number;
  y: number;
  fromX: number;
  fromY: number;
}) {
  const mx = pt((fromX + x) / 2 + (y < fromY ? 8 : -8));
  const my = pt((fromY + y) / 2);
  return (
    <g data-callout={mark} fill="none">
      <path
        d={`M${pt(fromX)} ${pt(fromY)} Q${mx} ${my} ${pt(x)} ${pt(y)}`}
        stroke="var(--ink)"
        strokeWidth={W.shade}
      />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        fill="var(--ink)"
        fontSize="8.5"
        fontStyle="italic"
        fontFamily="var(--font-display), 'Libre Baskerville', serif"
      >
        {mark}
      </text>
    </g>
  );
}

export function FigLabel({ n, x, y }: { n: 1 | 2; x: number; y: number }) {
  return (
    <text
      x={x}
      y={y}
      fill="var(--ink)"
      fontSize="11"
      fontStyle="italic"
      fontFamily="var(--font-display), 'Libre Baskerville', serif"
      textDecoration="underline"
    >
      {`Fig.${n}.`}
    </text>
  );
}
