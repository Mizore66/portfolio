import { BROADSHEET } from "@/content/opening";
import { PHASE2_MATCH } from "@/lib/chess/phase2";

export function EvaluationsColumn() {
  return (
    <section
      data-testid="evaluations-column"
      className="border-2 border-ink p-4"
      aria-label={BROADSHEET.evaluationsKicker}
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
        {BROADSHEET.evaluationsKicker}
      </p>
      <h2 className="mt-2 font-display text-[24px] leading-tight text-ink">
        {BROADSHEET.evaluationsHed}
      </h2>
      <p className="mt-4 font-lora text-[16px] leading-relaxed text-ink">{BROADSHEET.evaluationsDek}</p>
      <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.08em] text-faded">
        {PHASE2_MATCH.reportLine || BROADSHEET.evaluationsSprt}
      </p>
      <p className="mt-2 font-mono text-[12px] text-ink" data-testid="evaluations-net">
        {PHASE2_MATCH.netId} · {PHASE2_MATCH.regime}
      </p>
      <p className="mt-4 font-display text-[16px] italic leading-snug text-ink">
        {BROADSHEET.evaluationsHonesty}
      </p>
    </section>
  );
}
