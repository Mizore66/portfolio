import { POSITIONING } from "@/lib/metrics";

export function AboutBand() {
  return (
    <section id="about" data-testid="about-band" className="recruiter-band" aria-labelledby="about-heading">
      <p className="band-kicker">About</p>
      <h2 id="about-heading" className="band-title">
        {POSITIONING.dek}
      </h2>
      <p className="mt-4 max-w-[68ch] font-mono text-[12px] uppercase tracking-[0.08em] text-faded">
        {POSITIONING.seniority}
      </p>
      <p className="mt-3 max-w-[68ch] font-mono text-[12px] text-faded">{POSITIONING.nameNote}</p>
      <div className="mt-6 max-w-[68ch] space-y-4">
        {POSITIONING.about.map((para) => (
          <p key={para.slice(0, 24)} className="font-lora text-[16px] leading-[1.7] text-ink">
            {para}
          </p>
        ))}
      </div>
    </section>
  );
}
