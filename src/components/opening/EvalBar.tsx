"use client";

export function EvalBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const whitePct = Math.max(4, Math.min(96, 50 + value * 12));
  const whiteAhead = value >= 0;

  return (
    <div
      data-testid="eval-bar"
      className="relative w-10 shrink-0 self-stretch overflow-hidden border-2 border-ink bg-ink"
      role="meter"
      aria-label="Engine evaluation"
      aria-valuemin={-8}
      aria-valuemax={8}
      aria-valuenow={Number(value.toFixed(2))}
    >
      <div
        className="absolute bottom-0 left-0 right-0 bg-paper motion-safe:transition-[height] motion-safe:duration-500"
        style={{ height: `${whitePct}%` }}
      />
      <p
        data-testid="engine-eval"
        className="absolute inset-x-0 overflow-hidden whitespace-nowrap px-px text-center font-mono text-[9px] font-semibold leading-none tracking-tighter tabular-nums"
        style={{
          top: whiteAhead ? undefined : 5,
          bottom: whiteAhead ? 5 : undefined,
          color: whiteAhead ? "#1a120c" : "#f6eedc",
        }}
      >
        {label}
      </p>
    </div>
  );
}
