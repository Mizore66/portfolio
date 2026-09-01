import { EvidenceMeta } from "@/components/opening/EvidenceMeta";
import { HeroEngine } from "@/components/opening/HeroEngine";
import { RecruiterNav } from "@/components/opening/RecruiterNav";
import { StickyBoardStatic } from "@/components/opening/StickyBoardStatic";
import { BROADSHEET } from "@/content/opening";
import { getPublishedDocument } from "@/lib/cms/store";
import { activeAvailability } from "@/lib/cms/ledger";
import { resumeData } from "@/lib/data";
import { HERO_PROOF } from "@/lib/metrics";
import { SITE_HOST } from "@/lib/site";

function Contacts() {
  return (
    <>
      <div className="masthead-contacts hero-cta" data-testid="masthead-contacts">
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
    </>
  );
}

export async function Masthead() {
  const year = new Date().getFullYear();
  const site = await getPublishedDocument();
  const lead = HERO_PROOF.slice(0, 2);
  const rest = HERO_PROOF.slice(2);
  const dek = site.profile.dek;
  const tagline = site.profile.tagline;
  const desksLine = site.profile.desksLine;
  const howIWork = site.profile.howIWork;
  const availability = activeAvailability(site);

  return (
    <header>
      <div className="border-b-2 border-ink px-4 py-2 sm:px-6">
        <p className="masthead-kicker">
          Edition {year} · C50 · Italian Game · {SITE_HOST} · Moves are facts · Annotations are voice
        </p>
      </div>
      <RecruiterNav />
      <div className="hero-spread border-b-2 border-ink">
        <div className="hero-left">
          <div className="hero-identity px-4 pt-5 sm:px-6">
            <h1 className="masthead-title">Anas T. Qumhiyeh</h1>
            <p data-testid="masthead-role" className="mt-4 max-w-[68ch] font-display text-[20px] leading-snug text-ink">
              {dek}
            </p>
            <p
              data-testid="masthead-tagline"
              className="mt-2 max-w-[68ch] font-display text-[16px] leading-snug italic text-faded"
            >
              {tagline}
            </p>
            <p
              data-testid="masthead-how"
              className="mt-4 max-w-[68ch] font-display text-[16px] leading-snug text-ink"
            >
              <span data-testid="masthead-desks">{desksLine}</span> {howIWork}
            </p>
          </div>
          <div data-testid="masthead-proof" className="hero-proof-wrap">
            <ul className="hero-proof hero-proof-lead px-4 sm:px-6">
              {lead.map((item) => (
                <li key={item.label}>
                  <p className="metric-row">{item.label}</p>
                  <EvidenceMeta
                    note={item.kind === "production" ? item.owner : `${item.owner} · ${item.note}`}
                    kind={item.kind}
                  />
                </li>
              ))}
            </ul>
            <div className="hero-cta-block px-4 sm:px-6">
              <p
                data-testid="masthead-availability"
                className="mt-4 font-mono text-[12px] uppercase tracking-[0.12em] text-faded"
              >
                {availability}
              </p>
              <div className="mt-5">
                <Contacts />
              </div>
            </div>
            <ul className="hero-proof hero-proof-rest px-4 pb-5 sm:px-6" aria-label="Further proof">
              {rest.map((item) => (
                <li key={item.label}>
                  <p className="metric-row">{item.label}</p>
                  <EvidenceMeta
                    note={item.kind === "production" ? item.owner : `${item.owner} · ${item.note}`}
                    kind={item.kind}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
        <HeroEngine staticBoard={<StickyBoardStatic planeId="hero-board" />} />
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
