import { RecruiterNav } from "@/components/opening/RecruiterNav";
import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { HERO_DESKS, HERO_PROOF } from "@/lib/metrics";
import { SITE_HOST } from "@/lib/site";

export function Masthead() {
  const year = new Date().getFullYear();

  return (
    <header>
      <div className="border-b-2 border-ink px-4 py-2 sm:px-6">
        <p className="masthead-kicker">
          C50 · Italian Game · Vol. {year} · {SITE_HOST} · Moves are facts · Annotations are voice
        </p>
      </div>
      <RecruiterNav />
      <div className="border-b-2 border-ink px-4 py-5 sm:px-6">
        <div className="min-w-0">
          <h1 className="masthead-title">Anas T. Qumhiyeh</h1>
          <p data-testid="masthead-role" className="mt-4 max-w-[68ch] font-display text-[20px] leading-snug text-ink">
            {BROADSHEET.dek}
          </p>
          <p data-testid="masthead-tagline" className="mt-2 max-w-[68ch] font-display text-[16px] leading-snug italic text-faded">
            {BROADSHEET.tagline}
          </p>
          <p data-testid="masthead-desks" className="mt-4 font-display text-[16px] leading-snug text-ink">
            {HERO_DESKS.join(" · ")}
          </p>
          <p data-testid="masthead-proof" className="metric-row mt-3">
            {HERO_PROOF.map((item) => item.label).join(" · ")}
          </p>
          <p data-testid="masthead-availability" className="mt-4 font-mono text-[12px] uppercase tracking-[0.12em] text-faded">
            {BROADSHEET.availability}
          </p>
          <div className="masthead-contacts mt-5" data-testid="masthead-contacts">
            <a className="masthead-chip" href="#work">
              Selected work
            </a>
            <a className="masthead-chip" href={BROADSHEET.printHref}>
              {BROADSHEET.resumeLabel}
              <span className="ml-2 font-normal normal-case tracking-normal text-faded">
                {BROADSHEET.printEdition}
              </span>
            </a>
            <a className="masthead-chip" href="#contact">
              Contact
            </a>
          </div>
          <p className="masthead-quiet mt-3">
            <a
              className="external-mark"
              href={`https://${resumeData.github}`}
              target="_blank"
              rel="me noopener noreferrer"
            >
              GitHub
            </a>
            <span aria-hidden="true"> · </span>
            <a
              className="external-mark"
              href={`https://${resumeData.linkedin}`}
              target="_blank"
              rel="me noopener noreferrer"
            >
              LinkedIn
            </a>
          </p>
        </div>
      </div>
    </header>
  );
}
