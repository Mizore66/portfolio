import { useId } from "react";
import { Callout, Glyph, PatentDefs } from "@/components/opening/patent-glyphs";
import type { ApparatusPart, ApparatusSpec } from "@/lib/opening/types";

const DAGGER = "† composed from the archives";

function bedOf(parts: ApparatusPart[]) {
  const minX = Math.min(...parts.map((p) => p.x)) - 10;
  const maxX = Math.max(...parts.map((p) => p.x + p.w)) + 10;
  const maxY = Math.max(...parts.map((p) => p.y + p.h));
  return { x: minX, y: maxY - 6, w: maxX - minX, h: 16 };
}

function Pipes({ spec }: { spec: ApparatusSpec }) {
  const byN = new Map(spec.parts.map((p) => [p.n, p]));
  return (
    <g fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
      {spec.flow.slice(1).map((n, i) => {
        const a = byN.get(spec.flow[i]);
        const b = byN.get(n);
        if (!a || !b) return null;
        const x1 = Number((a.x + a.w * 0.72).toFixed(1));
        const y1 = Number((a.y + a.h * 0.55).toFixed(1));
        const x2 = Number((b.x + b.w * 0.28).toFixed(1));
        const y2 = Number((b.y + b.h * 0.55).toFixed(1));
        const mid = Number(((x1 + x2) / 2).toFixed(1));
        return <path key={`${a.n}-${b.n}`} d={`M ${x1} ${y1} H ${mid} V ${y2} H ${x2}`} />;
      })}
    </g>
  );
}

export function PatentFigure({ spec }: { spec: ApparatusSpec }) {
  const hatchId = useId().replace(/:/g, "") + "hatch";
  const presumed = spec.parts.some((p) => p.confidence === "presumed");
  const caption = `FIG. ${spec.fig} — APPARATUS FOR ${spec.function}. FILED ${spec.filed}.`;
  const { w, h } = spec.viewBox;
  const bed = bedOf(spec.parts);

  return (
    <figure
      className="patent-figure"
      data-testid="patent-figure"
      data-fig={spec.fig}
      data-layout={spec.layout}
    >
      <div className="patent-figure-mat">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label={caption}
          className="h-auto w-full text-ink"
        >
          <PatentDefs hatchId={hatchId} />
          <rect x="0" y="0" width={w} height={h} fill="var(--paper-deep)" />
          <rect
            x={bed.x}
            y={bed.y}
            width={bed.w}
            height={bed.h}
            fill={`url(#${hatchId})`}
            stroke="var(--ink)"
            strokeWidth="1.4"
          />
          <line
            x1="16"
            y1={h - 18}
            x2={w - 16}
            y2={h - 18}
            stroke="var(--ink)"
            strokeWidth="1.2"
          />
          <Pipes spec={spec} />
          {spec.parts.map((part) => (
            <Glyph key={part.n} part={part} hatchId={hatchId} />
          ))}
          {spec.parts.map((part) => (
            <Callout key={`c-${part.n}`} part={part} />
          ))}
          <text
            x={w - 16}
            y={h - 8}
            textAnchor="end"
            fill="var(--faded)"
            fontSize="8"
            fontFamily="var(--font-mono), ui-monospace, monospace"
          >
            {spec.filed}
          </text>
        </svg>
      </div>
      <figcaption className="patent-caption">
        {caption}
      </figcaption>
      <p className="patent-legend" data-testid="patent-legend">
        {spec.parts.map((part, i) => (
          <span key={part.n}>
            {i > 0 ? " · " : null}
            <span data-part-legend={part.n} data-confidence={part.confidence}>
              {part.n}. {part.label} — {part.mapsTo}
              {part.confidence === "presumed" ? "†" : ""}
            </span>
          </span>
        ))}
      </p>
      {presumed ? (
        <p className="patent-dagger" data-testid="patent-dagger">
          {DAGGER}
        </p>
      ) : null}
    </figure>
  );
}

export { DAGGER };
