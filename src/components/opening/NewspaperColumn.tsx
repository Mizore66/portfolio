"use client";

/** Vertical folio between the tree and the board — a printed column, not a gap. */
export function NewspaperColumn() {
  const year = new Date().getFullYear();
  const folio = `C50 · Italian Game · Vol. ${year}`;

  return (
    <div
      data-testid="newspaper-column"
      aria-hidden="true"
      className="newspaper-column min-[980px]:self-stretch"
    >
      <div className="flex items-center justify-center gap-3 border-y-2 border-ink px-3 py-2 min-[980px]:hidden">
        <span className="h-px flex-1 bg-ink" />
        <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-faded">{folio}</span>
        <span className="h-px flex-1 bg-ink" />
      </div>
      <div className="relative hidden h-full min-h-[12rem] w-[2.65rem] shrink-0 flex-col items-center self-stretch min-[980px]:flex">
        <div className="absolute inset-y-0 left-[5px] w-px bg-ink" />
        <div className="absolute inset-y-0 left-[8px] w-px bg-ink" />
        <div className="absolute inset-y-0 right-[5px] w-px bg-ink" />
        <div className="absolute inset-y-0 right-[8px] w-px bg-ink" />
        <p className="newspaper-folio my-auto px-0 text-center font-mono text-[10px] uppercase leading-none tracking-[0.32em] text-faded">
          {folio}
        </p>
      </div>
    </div>
  );
}
