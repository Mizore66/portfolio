"use client";

export function EvalBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const pct = Math.max(8, Math.min(92, 50 + value * 18));

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
          Narrative eval
        </p>
        <p className="font-mono text-[11px] text-score-red">{label}</p>
      </div>
      <div
        className="relative h-3 border-2 border-ink bg-ink"
        role="meter"
        aria-label="Narrative evaluation — not an engine"
        aria-valuemin={-3}
        aria-valuemax={3}
        aria-valuenow={Number(value.toFixed(2))}
      >
        <div
          className="absolute inset-y-0 left-0 bg-paper motion-safe:transition-[width] motion-safe:duration-500"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-score-red"
          style={{ left: `${pct}%` }}
        />
      </div>
      <p className="mt-1 font-mono text-[9px] uppercase tracking-wider text-faded">
        Playful bar · dips on ?! · not a search
      </p>
    </div>
  );
}
