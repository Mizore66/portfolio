import type { ReactNode } from "react";
import type { ApparatusPart, GlyphId } from "@/lib/opening/types";

const STROKE = 1.6;

function pt(n: number) {
  return Number(n.toFixed(2));
}

function inkFill(hatchId: string) {
  return {
    fill: `url(#${hatchId})`,
    stroke: "var(--ink)",
    strokeWidth: STROKE,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function inkLine() {
  return {
    fill: "none" as const,
    stroke: "var(--ink)",
    strokeWidth: STROKE,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
}

function Dust({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <g opacity="0.55" stroke="var(--ink)" strokeWidth="0.9" fill="none">
      <circle cx="18" cy="16" r="0.8" fill="var(--ink)" />
      <circle cx="78" cy="22" r="0.7" fill="var(--ink)" />
      <circle cx="62" cy="10" r="0.6" fill="var(--ink)" />
      <circle cx="30" cy="8" r="0.5" fill="var(--ink)" />
      <circle cx="88" cy="40" r="0.7" fill="var(--ink)" />
    </g>
  );
}

function Cobweb({ show }: { show?: boolean }) {
  if (!show) return null;
  return (
    <g opacity="0.45" stroke="var(--ink)" strokeWidth="0.7" fill="none">
      <path d="M58 18 L72 28 L64 38 L78 42" />
      <path d="M62 20 L70 36" />
      <path d="M68 24 L74 34" />
    </g>
  );
}

function Millwheel({ hatchId, dusty, idle }: { hatchId: string; dusty?: boolean; idle?: boolean }) {
  const paddles = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return (
      <line
        key={i}
        x1={pt(50 + Math.cos(a) * 11)}
        y1={pt(50 + Math.sin(a) * 11)}
        x2={pt(50 + Math.cos(a) * 40)}
        y2={pt(50 + Math.sin(a) * 40)}
        {...inkLine()}
      />
    );
  });
  return (
    <>
      <circle cx="50" cy="52" r="42" {...inkFill(hatchId)} />
      <circle cx="50" cy="52" r="11" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      {paddles}
      <line x1="50" y1="52" x2="98" y2="52" {...inkLine()} />
      <rect x="92" y="46" width="8" height="12" {...inkFill(hatchId)} />
      <path d="M8 94 H92" {...inkLine()} />
      <Dust show={dusty} />
      <Cobweb show={idle} />
    </>
  );
}

function Boiler({ hatchId }: { hatchId: string }) {
  return (
    <>
      <rect x="8" y="38" width="78" height="44" rx="18" {...inkFill(hatchId)} />
      <rect x="66" y="6" width="14" height="34" {...inkFill(hatchId)} />
      <path d="M70 6 Q73 0 80 4" {...inkLine()} />
      <circle cx="24" cy="60" r="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <line x1="18" y1="82" x2="18" y2="94" {...inkLine()} />
      <line x1="72" y1="82" x2="72" y2="94" {...inkLine()} />
      <path d="M6 94 H90" {...inkLine()} />
      <circle cx="40" cy="50" r="1.2" fill="var(--ink)" />
      <circle cx="52" cy="50" r="1.2" fill="var(--ink)" />
      <circle cx="64" cy="50" r="1.2" fill="var(--ink)" />
    </>
  );
}

function Belt({ slack }: { slack?: boolean }) {
  return (
    <>
      <circle cx="14" cy="50" r="13" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <circle cx="86" cy="50" r="13" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <circle cx="14" cy="50" r="4" fill="var(--ink)" />
      <circle cx="86" cy="50" r="4" fill="var(--ink)" />
      {slack ? (
        <>
          <path d="M16 38 C 40 34, 60 72, 84 38" {...inkLine()} />
          <path d="M16 62 C 42 86, 62 84, 84 62" {...inkLine()} />
        </>
      ) : (
        <>
          <line x1="16" y1="38" x2="84" y2="38" {...inkLine()} />
          <line x1="16" y1="62" x2="84" y2="62" {...inkLine()} />
        </>
      )}
    </>
  );
}

function Hopper({ hatchId }: { hatchId: string }) {
  return (
    <>
      <path d="M8 8 H92 L72 92 H28 Z" {...inkFill(hatchId)} />
      <rect x="28" y="88" width="44" height="10" {...inkLine()} />
    </>
  );
}

function Funnel({ hatchId, idle }: { hatchId: string; idle?: boolean }) {
  return (
    <g opacity={idle ? 0.55 : 1}>
      <path d="M12 8 H88 L58 58 H42 Z" {...inkFill(hatchId)} />
      <rect x="44" y="56" width="12" height="36" {...inkFill(hatchId)} />
    </g>
  );
}

function Valve({ hatchId }: { hatchId: string }) {
  return (
    <>
      <rect x="8" y="58" width="84" height="16" {...inkFill(hatchId)} />
      <circle cx="50" cy="38" r="22" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <line x1="50" y1="16" x2="50" y2="60" {...inkLine()} />
      <line x1="28" y1="38" x2="72" y2="38" {...inkLine()} />
      <line x1="34" y1="22" x2="66" y2="54" {...inkLine()} />
    </>
  );
}

function Tube({ hatchId }: { hatchId: string }) {
  return (
    <>
      <rect x="6" y="32" width="88" height="36" rx="16" {...inkFill(hatchId)} />
      <ellipse cx="10" cy="50" rx="8" ry="18" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <ellipse cx="90" cy="50" rx="8" ry="18" fill="var(--paper-deep)" stroke="var(--ink)" strokeWidth={STROKE} />
    </>
  );
}

function Capsule({ hatchId }: { hatchId: string }) {
  return <rect x="8" y="28" width="84" height="44" rx="22" {...inkFill(hatchId)} />;
}

function Gauge({ hatchId }: { hatchId: string }) {
  return (
    <>
      <circle cx="50" cy="50" r="42" {...inkFill(hatchId)} />
      <circle cx="50" cy="50" r="32" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = -Math.PI * 0.75 + (i * Math.PI * 1.5) / 7;
        return (
          <line
            key={i}
            x1={pt(50 + Math.cos(a) * 24)}
            y1={pt(50 + Math.sin(a) * 24)}
            x2={pt(50 + Math.cos(a) * 30)}
            y2={pt(50 + Math.sin(a) * 30)}
            {...inkLine()}
          />
        );
      })}
      <line x1="50" y1="50" x2="72" y2="28" stroke="var(--score-red)" strokeWidth="1.8" />
      <circle cx="50" cy="50" r="3" fill="var(--ink)" />
    </>
  );
}

function GaugePanel({ hatchId }: { hatchId: string }) {
  return (
    <>
      <rect x="4" y="18" width="92" height="64" {...inkFill(hatchId)} />
      {[22, 50, 78].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="50" r="12" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
          <line x1={cx} y1="50" x2={cx + 7} y2="42" stroke="var(--ink)" strokeWidth="1.2" />
        </g>
      ))}
    </>
  );
}

function Roller({ hatchId }: { hatchId: string }) {
  return (
    <>
      <ellipse cx="18" cy="50" rx="10" ry="28" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <rect x="18" y="22" width="64" height="56" {...inkFill(hatchId)} />
      <ellipse cx="82" cy="50" rx="10" ry="28" {...inkFill(hatchId)} />
    </>
  );
}

function Telegraph({ hatchId }: { hatchId: string }) {
  return (
    <>
      <rect x="8" y="58" width="84" height="28" {...inkFill(hatchId)} />
      <path d="M22 58 L22 30 L70 22" {...inkLine()} />
      <circle cx="70" cy="22" r="7" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <rect x="18" y="48" width="16" height="10" {...inkLine()} />
    </>
  );
}

function Governor({ hatchId }: { hatchId: string }) {
  return (
    <>
      <line x1="50" y1="8" x2="50" y2="88" {...inkLine()} />
      <rect x="44" y="6" width="12" height="8" {...inkFill(hatchId)} />
      <path d="M50 28 L22 58" {...inkLine()} />
      <path d="M50 28 L78 58" {...inkLine()} />
      <circle cx="22" cy="62" r="10" {...inkFill(hatchId)} />
      <circle cx="78" cy="62" r="10" {...inkFill(hatchId)} />
      <path d="M28 58 H72" {...inkLine()} />
      <rect x="38" y="86" width="24" height="10" {...inkFill(hatchId)} />
    </>
  );
}

function Mold({ hatchId }: { hatchId: string }) {
  return (
    <>
      <rect x="10" y="18" width="80" height="64" {...inkFill(hatchId)} />
      <path
        d="M38 30 V70 H46 L50 58 L54 70 H62 V30 H54 L50 42 L46 30 Z"
        fill="var(--paper)"
        stroke="var(--ink)"
        strokeWidth={STROKE}
      />
      <rect x="18" y="84" width="64" height="10" {...inkLine()} />
    </>
  );
}

function Crucible({ hatchId }: { hatchId: string }) {
  return (
    <>
      <ellipse cx="50" cy="28" rx="36" ry="12" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <path d="M14 28 L22 82 Q50 96 78 82 L86 28" {...inkFill(hatchId)} />
      <ellipse cx="50" cy="28" rx="36" ry="12" fill="none" stroke="var(--ink)" strokeWidth={STROKE} />
      <path d="M22 88 Q18 96 12 92" {...inkLine()} />
      <path d="M30 90 Q28 98 22 96" {...inkLine()} />
    </>
  );
}

function Typecase({ hatchId }: { hatchId: string }) {
  const cells = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 6; c++) {
      cells.push(
        <rect
          key={`${r}-${c}`}
          x={10 + c * 13}
          y={12 + r * 18}
          width="13"
          height="18"
          fill={r % 2 === c % 2 ? `url(#${hatchId})` : "var(--paper)"}
          stroke="var(--ink)"
          strokeWidth="1.1"
        />,
      );
    }
  }
  return (
    <>
      <rect x="6" y="8" width="88" height="84" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      {cells}
    </>
  );
}

function Vault({ hatchId }: { hatchId: string }) {
  return (
    <>
      <rect x="12" y="8" width="76" height="84" {...inkFill(hatchId)} />
      <rect x="22" y="18" width="56" height="64" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <circle cx="50" cy="50" r="14" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <circle cx="50" cy="50" r="4" fill="var(--ink)" />
      <line x1="50" y1="36" x2="50" y2="64" {...inkLine()} />
      <line x1="36" y1="50" x2="64" y2="50" {...inkLine()} />
    </>
  );
}

function Seal({ hatchId }: { hatchId: string }) {
  return (
    <>
      <rect x="28" y="8" width="12" height="52" {...inkFill(hatchId)} />
      <rect x="18" y="4" width="32" height="10" {...inkFill(hatchId)} />
      <path d="M34 8 L70 22" {...inkLine()} />
      <rect x="12" y="58" width="76" height="16" {...inkFill(hatchId)} />
      <rect x="22" y="78" width="56" height="16" {...inkLine()} />
    </>
  );
}

function Key({ hatchId }: { hatchId: string }) {
  return (
    <>
      <circle cx="50" cy="22" r="16" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <circle cx="50" cy="22" r="6" fill="none" stroke="var(--ink)" strokeWidth={STROKE} />
      <rect x="46" y="36" width="8" height="48" {...inkFill(hatchId)} />
      <path d="M54 68 H70 V76 H54 M54 80 H64 V88 H54" {...inkLine()} />
    </>
  );
}

function Relay({ hatchId }: { hatchId: string }) {
  return (
    <>
      <rect x="8" y="22" width="84" height="56" {...inkFill(hatchId)} />
      <rect x="20" y="34" width="28" height="32" fill="var(--paper)" stroke="var(--ink)" strokeWidth={STROKE} />
      <path d="M48 50 H78 M74 42 V58" {...inkLine()} />
      <line x1="24" y1="40" x2="44" y2="40" {...inkLine()} />
      <line x1="24" y1="50" x2="44" y2="50" {...inkLine()} />
      <line x1="24" y1="60" x2="44" y2="60" {...inkLine()} />
    </>
  );
}

function Ledger({ hatchId }: { hatchId: string }) {
  return (
    <>
      <path d="M12 20 L50 12 L88 20 V88 L50 78 L12 88 Z" {...inkFill(hatchId)} />
      <path d="M50 12 V78" {...inkLine()} />
      <line x1="22" y1="36" x2="42" y2="34" {...inkLine()} />
      <line x1="22" y1="48" x2="42" y2="46" {...inkLine()} />
      <line x1="58" y1="34" x2="78" y2="36" {...inkLine()} />
      <line x1="58" y1="46" x2="78" y2="48" {...inkLine()} />
    </>
  );
}

const DRAW: Record<
  GlyphId,
  (p: { hatchId: string; dusty?: boolean; idle?: boolean; slack?: boolean }) => ReactNode
> = {
  millwheel: (p) => <Millwheel {...p} />,
  boiler: (p) => <Boiler {...p} />,
  belt: (p) => <Belt slack={p.slack} />,
  hopper: (p) => <Hopper {...p} />,
  funnel: (p) => <Funnel {...p} />,
  valve: (p) => <Valve {...p} />,
  tube: (p) => <Tube {...p} />,
  capsule: (p) => <Capsule {...p} />,
  gauge: (p) => <Gauge {...p} />,
  gaugepanel: (p) => <GaugePanel {...p} />,
  roller: (p) => <Roller {...p} />,
  telegraph: (p) => <Telegraph {...p} />,
  governor: (p) => <Governor {...p} />,
  mold: (p) => <Mold {...p} />,
  crucible: (p) => <Crucible {...p} />,
  typecase: (p) => <Typecase {...p} />,
  vault: (p) => <Vault {...p} />,
  seal: (p) => <Seal {...p} />,
  key: (p) => <Key {...p} />,
  relay: (p) => <Relay {...p} />,
  ledger: (p) => <Ledger {...p} />,
};

export function PatentDefs({ hatchId }: { hatchId: string }) {
  return (
    <defs>
      <pattern
        id={hatchId}
        patternUnits="userSpaceOnUse"
        width="5.5"
        height="5.5"
        patternTransform="rotate(-45)"
      >
        <line x1="0" y1="0" x2="0" y2="5.5" stroke="var(--ink)" strokeWidth="1.15" />
      </pattern>
    </defs>
  );
}

export function Glyph({
  part,
  hatchId,
}: {
  part: ApparatusPart;
  hatchId: string;
}) {
  return (
    <g data-glyph={part.glyph} data-part={part.n} transform={`translate(${part.x} ${part.y})`}>
      <svg width={part.w} height={part.h} viewBox="0 0 100 100" overflow="visible">
        {DRAW[part.glyph]({
          hatchId,
          dusty: part.dusty,
          idle: part.idle,
          slack: part.slack,
        })}
      </svg>
    </g>
  );
}

export function Callout({ part }: { part: ApparatusPart }) {
  const fromX = part.x + part.w / 2;
  const fromY = part.y + 4;
  return (
    <g data-callout={part.n} fill="none">
      <line
        x1={fromX}
        y1={fromY}
        x2={part.callout.x}
        y2={part.callout.y}
        stroke="var(--score-red)"
        strokeWidth="1"
      />
      <circle cx={part.callout.x} cy={part.callout.y} r="9" fill="var(--paper)" stroke="var(--score-red)" strokeWidth="1.2" />
      <text
        x={part.callout.x}
        y={part.callout.y + 3.5}
        textAnchor="middle"
        fill="var(--score-red)"
        fontSize="11"
        fontFamily="var(--font-mono), ui-monospace, monospace"
        fontWeight="700"
      >
        {part.n}
      </text>
    </g>
  );
}
