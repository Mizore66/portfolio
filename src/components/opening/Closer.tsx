import { BROADSHEET } from "@/content/opening";

export function Closer() {
  return (
    <section
      data-testid="closer"
      className="border-2 border-ink p-4"
      aria-label={BROADSHEET.closerKicker}
    >
      <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">
        {BROADSHEET.closerKicker}
      </p>
      <h2 className="mt-2 font-display text-[24px] leading-tight text-ink">{BROADSHEET.closerHed}</h2>
      <p className="mt-4 font-lora text-[16px] leading-relaxed text-ink">{BROADSHEET.closer}</p>
      <p className="mt-8 font-display text-[16px] italic text-ink">{BROADSHEET.closerSign}</p>
    </section>
  );
}
