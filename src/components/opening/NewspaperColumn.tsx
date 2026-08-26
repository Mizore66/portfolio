"use client";

/** Empty gutter with a double hairline — a newspaper column gap, not a running folio. */
export function NewspaperColumn() {
  return (
    <div
      data-testid="newspaper-column"
      aria-hidden="true"
      className="min-[980px]:self-stretch"
    >
      <div className="mx-6 border-t border-ink min-[980px]:hidden" />
      <div className="relative hidden h-full w-5 shrink-0 min-[980px]:block">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-[2px] bg-ink" />
        <span className="absolute inset-y-0 left-1/2 w-px translate-x-[1px] bg-ink" />
      </div>
    </div>
  );
}
