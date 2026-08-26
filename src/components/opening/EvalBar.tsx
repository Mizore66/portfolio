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
      className="relative w-[22px] shrink-0 self-stretch border-2 border-ink bg-ink"
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
        className="absolute inset-x-0 px-0.5 text-center font-mono text-[9px] leading-tight tracking-tight"
        style={{
          top: whiteAhead ? undefined : 6,
          bottom: whiteAhead ? 6 : undefined,
          color: whiteAhead ? "#1a120c" : "#f6eedc",
        }}
      >
        {label}
      </p>
    </div>
  );
}
