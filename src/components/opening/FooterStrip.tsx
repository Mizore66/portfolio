import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";

export function FooterStrip() {
  return (
    <section data-testid="footer-strip" className="footer-strip" aria-label="Close">
      <p className="font-display text-[20px] leading-tight text-ink">{resumeData.name}</p>
      <p className="masthead-quiet mt-4">
        <a href={BROADSHEET.colophonHref}>{BROADSHEET.colophonKicker}</a>
        <span aria-hidden="true"> · </span>
        <a href={BROADSHEET.paperHref}>C50</a>
      </p>
      <p className="mt-6 font-display text-[18px] italic text-score-red">1–0</p>
    </section>
  );
}
