import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { POSITIONING } from "@/lib/metrics";

export function FooterStrip() {
  return (
    <section data-testid="footer-strip" className="footer-strip" aria-label="Close">
      <p className="font-display text-[20px] leading-tight text-ink">{resumeData.name}</p>
      <p className="mt-1 max-w-[68ch] font-display text-[16px] leading-snug text-ink">{POSITIONING.dek}</p>
      <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.12em] text-faded">
        {POSITIONING.availability}
      </p>
      <p className="masthead-quiet mt-4">
        <a href={`mailto:${resumeData.email}`}>Email</a>
        <span aria-hidden="true"> · </span>
        <a href={BROADSHEET.printHref}>{BROADSHEET.resumeLabel}</a>
        <span aria-hidden="true"> · </span>
        <a href={`https://${resumeData.github}`} target="_blank" rel="me noopener noreferrer" className="external-mark">
          GitHub
        </a>
        <span aria-hidden="true"> · </span>
        <a href={`https://${resumeData.linkedin}`} target="_blank" rel="me noopener noreferrer" className="external-mark">
          LinkedIn
        </a>
      </p>
      <p className="mt-6 font-display text-[18px] italic text-score-red">1–0</p>
    </section>
  );
}
