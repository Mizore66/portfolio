"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import Image from "next/image";
import { pt } from "@/components/opening/patent-ink";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import type { ApparatusSpec, GlyphId, PatentNumeral } from "@/lib/opening/types";

function patentDateLine(spec: ApparatusSpec): string {
  return spec.dateKind === "illustration" ? `Illustration ${spec.filed}.` : `Filed ${spec.filed}.`;
}
const DAGGER = "† composed from the archives";
const INVENTOR = "ANAS T. QUMHIYEH.";
const INVENTOR_SIGN = "Anas Tarek Qumhiyeh";
const FURNITURE = { w: 720, head: 80, foot: 78 };

function SheetHeader({ spec }: { spec: ApparatusSpec }) {
  const w = FURNITURE.w;
  const sheets = spec.sheets ?? 2;
  const sheet = spec.sheet ?? 1;
  return (
    <svg
      viewBox={`0 0 ${w} ${FURNITURE.head}`}
      className="h-auto w-full text-ink"
      aria-hidden="true"
    >
      <g fill="var(--ink)" fontFamily="var(--font-display), 'Libre Baskerville', serif">
        <text x={16} y={18} fontSize="9">
          (No Model.)
        </text>
        <text x={w - 16} y={18} fontSize="9" textAnchor="end">
          {`${sheets} Sheets—Sheet ${sheet}.`}
        </text>
        <text x={w / 2} y={36} fontSize="11" textAnchor="middle" letterSpacing="0.16em">
          {INVENTOR}
        </text>
        <text x={w / 2} y={52} fontSize="10" textAnchor="middle" letterSpacing="0.18em">
          {`APPARATUS FOR ${spec.function}.`}
        </text>
        <text x={16} y={68} fontSize="9">
          {`No. ${spec.move}.`}
        </text>
        <text x={w - 16} y={68} fontSize="9" textAnchor="end">
          {patentDateLine(spec)}
        </text>
        <line x1={16} y1={74} x2={w - 16} y2={74} stroke="var(--ink)" strokeWidth="0.7" />
      </g>
    </svg>
  );
}

function SignatureBlock() {
  const w = FURNITURE.w;
  const y = 12;
  return (
    <svg
      viewBox={`0 0 ${w} ${FURNITURE.foot}`}
      className="h-auto w-full text-ink"
      aria-hidden="true"
    >
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
        <text x={w - 24} y={y + 28} fontSize="13" fontStyle="italic" textAnchor="end">
          {INVENTOR_SIGN}
        </text>
        <path
          d={`M${w - 200} ${y + 34} C ${w - 140} ${y + 42}, ${w - 80} ${y + 24}, ${w - 24} ${y + 36}`}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="0.55"
        />
      </g>
    </svg>
  );
}

function OverlayCallout({
  mark,
  x,
  y,
  fromX,
  fromY,
  glyph,
}: PatentNumeral & { glyph?: GlyphId }) {
  const mx = pt((fromX + x) / 2 + (y < fromY ? 2.1 : -2.1));
  const my = pt((fromY + y) / 2);
  const d = `M${pt(fromX)} ${pt(fromY)} Q${mx} ${my} ${pt(x)} ${pt(y)}`;
  return (
    <g data-callout={mark} data-glyph={glyph} data-halo="paper">
      <path d={d} className="patent-leader-halo" />
      <path d={d} className="patent-leader-ink" />
      <circle cx={fromX} cy={fromY} r="0.55" className="patent-anchor" />
      <text
        x={x}
        y={y + 0.75}
        textAnchor="middle"
        fontSize="2.35"
        fontStyle="italic"
        fontFamily="var(--font-display), 'Libre Baskerville', serif"
        className="patent-numeral"
      >
        {mark}
      </text>
    </g>
  );
}

function OverlayFigLabel({
  n,
  x,
  y,
  caption,
}: {
  n: 1 | 2;
  x: number;
  y: number;
  caption?: string;
}) {
  return (
    <g data-halo="paper">
      <text
        x={x}
        y={y}
        fontSize="2.6"
        fontStyle="italic"
        fontFamily="var(--font-display), 'Libre Baskerville', serif"
        textDecoration="underline"
        className="patent-fig-label"
      >
        {`Fig.${n}.`}
      </text>
      {caption ? (
        <text
          x={x + 8}
          y={y}
          fontSize="1.9"
          fontStyle="italic"
          fontFamily="var(--font-display), 'Libre Baskerville', serif"
          className="patent-fig-caption"
        >
          {caption}
        </text>
      ) : null}
    </g>
  );
}

function Overlay({ spec }: { spec: ApparatusSpec }) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="patent-overlay"
      aria-hidden="true"
    >
      {spec.numerals.map((m) => (
        <OverlayCallout key={m.mark} {...m} />
      ))}
      {spec.figLabels.map((lab) => (
        <OverlayFigLabel key={lab.n} {...lab} />
      ))}
    </svg>
  );
}

function Engraving({ spec, labeled }: { spec: ApparatusSpec; labeled?: boolean }) {
  return (
    <div className="patent-engraving" data-testid={labeled ? "patent-engraving" : undefined}>
      <Image
        src={spec.engraving.src}
        alt=""
        width={spec.engraving.width}
        height={spec.engraving.height}
        className="patent-engraving-img"
        sizes={IMAGE_SIZES.patentSheet}
      />
      <Overlay spec={spec} />
    </div>
  );
}

export function PatentFigure({ spec }: { spec: ApparatusSpec }) {
  const presumed = spec.parts.filter((p) => p.confidence === "presumed");
  const chapterDagger = presumed.length * 2 > spec.parts.length;
  const showDagger = presumed.length > 0;
  const caption = `APPARATUS FOR ${spec.function}. ${patentDateLine(spec)}`;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const invokerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const open = useCallback(() => {
    const active = document.activeElement;
    invokerRef.current = active instanceof HTMLElement ? active : null;
    const dlg = dialogRef.current;
    if (!dlg) return;
    dlg.showModal();
    const closeBtn = dlg.querySelector<HTMLElement>("button");
    closeBtn?.focus();
  }, []);

  const swipeStart = useRef<number | null>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === dlg) close();
    };
    const onClose = () => {
      invokerRef.current?.focus();
    };
    const focusables = () =>
      [...dlg.querySelectorAll<HTMLElement>("button, [href], [tabindex]:not([tabindex='-1'])")].filter(
        (el) => !el.hasAttribute("disabled"),
      );
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !dlg.open) return;
      const nodes = focusables();
      if (nodes.length === 0) {
        e.preventDefault();
        dlg.focus();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (!dlg.contains(active)) {
        e.preventDefault();
        first.focus();
        return;
      }
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === dlg)) {
        e.preventDefault();
        last.focus();
      }
    };
    dlg.addEventListener("click", onClick);
    dlg.addEventListener("close", onClose);
    document.addEventListener("keydown", onKey, true);
    return () => {
      dlg.removeEventListener("click", onClick);
      dlg.removeEventListener("close", onClose);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [close]);

  return (
      <figure
      className="patent-figure"
      data-testid="patent-figure"
      data-fig={spec.fig}
      data-layout={spec.layout}
      data-move={spec.move}
      aria-label={spec.engraving.alt}
    >
      <div className="patent-figure-mat">
        <div aria-hidden="true">
          <SheetHeader spec={spec} />
        </div>
        <div className="relative">
          <div aria-hidden="true">
            <Engraving spec={spec} labeled />
          </div>
          <button
            type="button"
            className="patent-expand-hit"
            data-testid="patent-expand"
            aria-haspopup="dialog"
            aria-label="Expand patent sheet"
            onClick={open}
          />
        </div>
        <div aria-hidden="true">
          <SignatureBlock />
        </div>
      </div>
      <div className="patent-reference" data-testid="patent-legend">
        <p className="patent-sheet-mark font-mono text-[12px] text-faded">
          (No Model.) {`${spec.sheets ?? 2} Sheets—Sheet ${spec.sheet ?? 1}.`}
        </p>
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
        <details className="patent-transcript">
          <summary>Diagram description</summary>
          <p className="mt-2 font-display text-[16px] leading-snug">{spec.engraving.alt}</p>
          <ol className="mt-2">
            {spec.parts.map((part) => (
              <li key={`t-${part.n}`}>
                {part.n}. {part.label} — {part.mapsTo}
              </li>
            ))}
          </ol>
        </details>
        {showDagger ? (
          <p className="patent-dagger" data-testid="patent-dagger">
            {DAGGER}
          </p>
        ) : null}
      </div>
      <dialog
        ref={dialogRef}
        className="patent-lightbox"
        data-testid="patent-lightbox"
        aria-labelledby={titleId}
        aria-modal="true"
        tabIndex={-1}
        onTouchStart={(e) => {
          swipeStart.current = e.touches[0]?.clientY ?? null;
        }}
        onTouchEnd={(e) => {
          const start = swipeStart.current;
          const y = e.changedTouches[0]?.clientY;
          swipeStart.current = null;
          if (start == null || y == null) return;
          if (y - start > 64) close();
        }}
      >
        <div className="patent-lightbox-sheet">
          <div className="flex items-start justify-between gap-3 border-b border-ink pb-2">
            <p id={titleId} className="font-display text-[16px] italic text-ink">
              {caption}
            </p>
            <button
              type="button"
              className="hit-target shrink-0 border-2 border-ink px-3 font-mono text-[12px] uppercase tracking-widest"
              onClick={close}
            >
              Close
            </button>
          </div>
          <div className="patent-lightbox-well">
            <Engraving spec={spec} />
          </div>
        </div>
      </dialog>
    </figure>
  );
}

export { DAGGER };
