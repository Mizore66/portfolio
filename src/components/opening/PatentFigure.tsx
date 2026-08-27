import { useId } from "react";
import { Callout, FigLabel, Glyph } from "@/components/opening/patent-glyphs";
import { SectionHatch, W } from "@/components/opening/patent-ink";
import type { ApparatusPart, ApparatusSpec, GlyphId, PatentNumeral } from "@/lib/opening/types";

const DAGGER = "† composed from the archives";
const INVENTOR = "A. T. QUMHIYEH.";
const INVENTOR_SIGN = "Anas Tarek Qumhiyeh";
const MEDIUM: ReadonlySet<GlyphId> = new Set(["tube", "belt"]);

function paintOrder(parts: ApparatusPart[]) {
  return [...parts].sort((a, b) => {
    const am = MEDIUM.has(a.glyph) ? 0 : 1;
    const bm = MEDIUM.has(b.glyph) ? 0 : 1;
    if (am !== bm) return am - bm;
    return a.n - b.n;
  });
}

function numeralsOf(spec: ApparatusSpec): PatentNumeral[] {
  if (spec.numerals && spec.numerals.length > 0) return spec.numerals;
  const fromParts = (parts: ApparatusPart[]) =>
    parts.map((p) => ({
      mark: p.mark ?? String(p.n),
      x: p.callout.x,
      y: p.callout.y,
      fromX: p.anchor?.x ?? p.x + p.w / 2,
      fromY: p.anchor?.y ?? p.y + 4,
    }));
  return [...fromParts(spec.parts), ...fromParts(spec.detail?.parts ?? [])];
}

function Bedplate({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g fill="none" stroke="var(--ink)" strokeWidth={W.outline} strokeLinejoin="round">
      <rect x={x} y={y} width={w} height={14} />
      <line x1={x} y1={y + 4} x2={x + w} y2={y + 4} strokeWidth={W.detail} />
      {Array.from({ length: Math.max(4, Math.round(w / 70)) }, (_, i) => {
        const bx = x + 18 + i * 70;
        return (
          <g key={i} strokeWidth={W.detail}>
            <circle cx={bx} cy={y + 7} r={1.4} />
          </g>
        );
      })}
    </g>
  );
}

function SheetHeader({ spec }: { spec: ApparatusSpec }) {
  const { w } = spec.viewBox;
  return (
    <g fill="var(--ink)" fontFamily="var(--font-display), 'Libre Baskerville', serif">
      <text x={16} y={18} fontSize="9">
        (No Model.)
      </text>
      <text x={w - 16} y={18} fontSize="9" textAnchor="end">
        2 Sheets—Sheet 1.
      </text>
      <text
        x={w / 2}
        y={36}
        fontSize="11"
        textAnchor="middle"
        letterSpacing="0.28em"
      >
        {INVENTOR}
      </text>
      <text
        x={w / 2}
        y={52}
        fontSize="10"
        textAnchor="middle"
        letterSpacing="0.18em"
      >
        {`APPARATUS FOR ${spec.function}.`}
      </text>
      <text x={16} y={68} fontSize="9">
        {`No. ${spec.move}.`}
      </text>
      <text x={w - 16} y={68} fontSize="9" textAnchor="end">
        {`Filed ${spec.filed}.`}
      </text>
      <line x1={16} y1={74} x2={w - 16} y2={74} stroke="var(--ink)" strokeWidth="0.7" />
    </g>
  );
}

function SignatureBlock({ w, y }: { w: number; y: number }) {
  return (
    <g fill="var(--ink)" fontFamily="var(--font-display), 'Libre Baskerville', serif">
      <text x={24} y={y} fontSize="8" letterSpacing="0.16em">
        WITNESSES:
      </text>
      <text x={24} y={y + 22} fontSize="12" fontStyle="italic">
        Vitest
      </text>
      <line x1={24} y1={y + 26} x2={150} y2={y + 26} stroke="var(--ink)" strokeWidth="0.5" />
      <text x={24} y={y + 46} fontSize="12" fontStyle="italic">
        Playwright
      </text>
      <line x1={24} y1={y + 50} x2={150} y2={y + 50} stroke="var(--ink)" strokeWidth="0.5" />
      <text x={w - 24} y={y} fontSize="8" textAnchor="end" letterSpacing="0.16em">
        INVENTOR
      </text>
      <text
        x={w - 24}
        y={y + 28}
        fontSize="13"
        fontStyle="italic"
        textAnchor="end"
      >
        {INVENTOR_SIGN}
      </text>
      <path
        d={`M${w - 200} ${y + 34} C ${w - 140} ${y + 42}, ${w - 80} ${y + 24}, ${w - 24} ${y + 36}`}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="0.55"
      />
    </g>
  );
}

export function PatentFigure({ spec }: { spec: ApparatusSpec }) {
  const hatchId = useId().replace(/:/g, "") + "hatch";
  const presumed = spec.parts.filter((p) => p.confidence === "presumed");
  const chapterDagger = presumed.length * 2 > spec.parts.length;
  const showDagger = presumed.length > 0;
  const caption = `APPARATUS FOR ${spec.function}. Filed ${spec.filed}.`;
  const { w, h } = spec.viewBox;
  const marks = numeralsOf(spec);
  const bedY = Math.max(...spec.parts.map((p) => p.y + p.h)) + 4;
  const bedX = Math.min(...spec.parts.map((p) => p.x)) - 8;
  const bedW = Math.max(...spec.parts.map((p) => p.x + p.w)) - bedX + 8;

  return (
    <figure
      className="patent-figure"
      data-testid="patent-figure"
      data-fig={spec.fig}
      data-layout={spec.layout}
      data-move={spec.move}
    >
      <div className="patent-figure-mat">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={caption}
          className="h-auto w-full text-ink"
        >
          <defs>
            <SectionHatch hatchId={hatchId} />
          </defs>
          <rect x="0" y="0" width={w} height={h} fill="var(--paper)" />
          <rect
            x="6"
            y="6"
            width={w - 12}
            height={h - 12}
            fill="none"
            stroke="var(--ink)"
            strokeWidth="0.55"
          />
          <SheetHeader spec={spec} />
          <Bedplate x={bedX} y={bedY} w={bedW} />
          {paintOrder(spec.parts).map((part) => (
            <Glyph key={`m-${part.n}`} part={part} hatchId={hatchId} />
          ))}
          <FigLabel n={1} x={20} y={Math.min(bedY + 26, (spec.detail?.parts[0]?.y ?? h) - 14)} />
          {spec.detail ? (
            <>
              {spec.detail.parts.map((part) => (
                <Glyph key={`d-${part.n}-${part.x}`} part={part} hatchId={hatchId} />
              ))}
              <FigLabel n={2} x={20} y={Math.min(...spec.detail.parts.map((p) => p.y)) - 12} />
              <text
                x={64}
                y={Math.min(...spec.detail.parts.map((p) => p.y)) - 12}
                fill="var(--faded)"
                fontSize="8"
                fontStyle="italic"
                fontFamily="var(--font-display), 'Libre Baskerville', serif"
              >
                {spec.detail.title}
              </text>
            </>
          ) : null}
          {marks.map((m) => (
            <Callout key={m.mark} {...m} />
          ))}
          <SignatureBlock w={w} y={h - 70} />
        </svg>
      </div>
      <div className="patent-reference" data-testid="patent-legend">
        <p className="patent-reference-kicker">Reference</p>
        <ol className="patent-reference-grid">
          {spec.parts.map((part) => (
            <li key={part.n} data-part-legend={part.n} data-confidence={part.confidence}>
              <span className="patent-reference-n">{part.n}.</span>
              {part.label} — {part.mapsTo}
              {!chapterDagger && part.confidence === "presumed" ? "†" : ""}
            </li>
          ))}
        </ol>
        {showDagger ? (
          <p className="patent-dagger" data-testid="patent-dagger">
            {DAGGER}
          </p>
        ) : null}
      </div>
    </figure>
  );
}

export { DAGGER };
