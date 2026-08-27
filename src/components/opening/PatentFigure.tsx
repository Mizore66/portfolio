import { useId } from "react";
import { Callout, Glyph, PatentDefs } from "@/components/opening/patent-glyphs";
import type { ApparatusSpec } from "@/lib/opening/types";

const DAGGER = "† composed from the archives";

export function PatentFigure({ spec }: { spec: ApparatusSpec }) {
  const hatchId = useId().replace(/:/g, "") + "hatch";
  const presumed = spec.parts.some((p) => p.confidence === "presumed");
  const caption = `FIG. ${spec.fig} — APPARATUS FOR ${spec.function}. FILED ${spec.filed}.`;
  const { w, h } = spec.viewBox;

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
          <line
            x1="16"
            y1={h - 18}
            x2={w - 16}
            y2={h - 18}
            stroke="var(--ink)"
            strokeWidth="1.2"
          />
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
