import { BROADSHEET } from "@/content/opening";
import { PHASE2_MATCH } from "@/lib/chess/phase2";

export function EvaluationsColumn() {
  const elo = PHASE2_MATCH.elo;
  const sign = elo >= 0 ? "+" : "";
  const winner = elo >= 0 ? "LEARNED DEFEATS HANDCRAFTED" : "HANDCRAFTED DEFEATS LEARNED";
  return (
    <section
      data-testid="evaluations-column"
      className="border-2 border-ink p-3"
      aria-label={BROADSHEET.evaluationsKicker}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-faded">
        {BROADSHEET.evaluationsKicker}
      </p>
      <h2 className="mt-2 font-display text-[22px] leading-tight text-ink">
        {BROADSHEET.evaluationsHed || `${winner} BY ${sign}${elo.toFixed(1)}`}
      </h2>
      <p className="mt-2 font-lora text-[13px] leading-relaxed text-ink">{BROADSHEET.evaluationsDek}</p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-faded">
        {PHASE2_MATCH.sprtLine || BROADSHEET.evaluationsSprt}
      </p>
      <p className="mt-2 font-display text-[13px] italic leading-snug text-ink">
        {BROADSHEET.evaluationsHonesty}
      </p>
    </section>
  );
}
