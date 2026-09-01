import { EvidenceMeta } from "@/components/opening/EvidenceMeta";
import { RecruiterNav } from "@/components/opening/RecruiterNav";
import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { HERO_PROOF, POSITIONING } from "@/lib/metrics";
import { SITE_HOST } from "@/lib/site";

export function Masthead() {
  const year = new Date().getFullYear();

  return (
    <header>
      <div className="border-b-2 border-ink px-4 py-2 sm:px-6">
        <p className="masthead-kicker">
          Edition {year} · C50 · Italian Game · {SITE_HOST} · Moves are facts · Annotations are voice
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
            {POSITIONING.desksLine}
          </p>
          <p data-testid="masthead-how" className="mt-2 max-w-[68ch] font-display text-[16px] leading-snug text-ink">
            {POSITIONING.howIWork}
          </p>
          <ul data-testid="masthead-proof" className="hero-proof mt-4">
            {HERO_PROOF.map((item) => (
              <li key={item.label}>
                <p className="metric-row">{item.label}</p>
                <EvidenceMeta
                  note={item.kind === "production" ? item.owner : `${item.owner} · ${item.note}`}
                  kind={item.kind}
                />
              </li>
            ))}
          </ul>
          <p data-testid="masthead-availability" className="mt-4 font-mono text-[12px] uppercase tracking-[0.12em] text-faded">
            {BROADSHEET.availability}
          </p>
          <div className="masthead-contacts hero-cta mt-5" data-testid="masthead-contacts">
            <a className="masthead-chip masthead-chip-primary" href="/#work">
              Selected work
            </a>
            <a className="masthead-chip" href="/#contact">
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

export function PaperMasthead() {
  const year = new Date().getFullYear();

  return (
    <header data-testid="paper-masthead">
      <div className="border-b-2 border-ink px-4 py-2 sm:px-6">
        <p className="masthead-kicker">
          Edition {year} · C50 · Italian Game · {SITE_HOST} · Moves are facts · Annotations are voice
        </p>
      </div>
      <RecruiterNav />
      <div className="border-b-2 border-ink px-4 py-4 sm:px-6">
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-faded">Scoresheet</p>
        <h1 id="paper-title" data-testid="paper-title" className="masthead-title">
          Opening Preparation
        </h1>
        <p data-testid="paper-dek" className="mt-3 max-w-[68ch] font-display text-[18px] leading-snug text-ink">
          {BROADSHEET.gameDek}
        </p>
        <p data-testid="how-to-read" className="mt-2 max-w-[68ch] font-display text-[16px] italic text-faded">
          {BROADSHEET.howToRead}
        </p>
        <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.12em] text-faded">Anas T. Qumhiyeh</p>
        <p className="mt-4">
          <a
            href="/"
            className="font-mono text-[12px] uppercase tracking-widest text-book-blue underline decoration-2 underline-offset-4"
          >
            ← {BROADSHEET.homeLink}
          </a>
        </p>
      </div>
    </header>
  );
}
