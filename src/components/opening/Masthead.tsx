import { EvidenceMeta } from "@/components/opening/EvidenceMeta";
import { ExternalLink } from "@/components/opening/ExternalLink";
import { RecruiterNav } from "@/components/opening/RecruiterNav";
import { BROADSHEET } from "@/content/opening";
import { getRenderableDocument } from "@/lib/cms/store";
import { activeAvailability } from "@/lib/cms/ledger";
import { heroProofRows } from "@/lib/cms/overlay";
import { resumeData } from "@/lib/data";
import { formatClaimDate } from "@/lib/filed";
import { EVIDENCE_TIER, POSITIONING } from "@/lib/metrics";
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
        <ExternalLink
          className="external-mark"
          href={`https://${resumeData.github}`}
          rel="me noopener noreferrer"
        >
          GitHub
        </ExternalLink>
        <span aria-hidden="true"> · </span>
        <ExternalLink
          className="external-mark"
          href={`https://${resumeData.linkedin}`}
          rel="me noopener noreferrer"
        >
          LinkedIn
        </ExternalLink>
      </p>
    </>
  );
}

export function EditionKicker() {
  const year = new Date().getFullYear();
  return (
    <div className="border-b-2 border-ink px-4 py-2 sm:px-6">
      <p className="masthead-kicker">
        Edition {year} · C50 · Italian Game · {SITE_HOST} · Moves are facts · Annotations are voice
      </p>
    </div>
  );
}

export async function HeroIdentity() {
  const site = await getRenderableDocument();
  const dek = site.profile.dek;
  const tagline = site.profile.tagline;
  const availability = activeAvailability(site);
  const proof = heroProofRows(site);

  return (
    <div className="hero-left" data-testid="hero-identity">
      <div className="hero-identity px-4 pt-5 sm:px-6" data-testid="hero-identity-block">
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
      </div>
      <p
        data-testid="ownership-bridge"
        className="hero-bridge mt-4 max-w-[68ch] px-4 font-display text-[16px] leading-snug text-ink sm:px-6"
      >
        {POSITIONING.ownershipBridge}
      </p>
      <div data-testid="masthead-proof" className="hero-proof-wrap px-4 sm:px-6">
        <ul id="proof" className="hero-proof" aria-label="Filed proof">
          {proof.map((item, index) => {
            const caveat = item.note;
            const date = item.date ? formatClaimDate(item.date) : "";
            const note = [item.kind === "production" ? item.owner : `${item.owner} · ${caveat}`, date]
              .filter(Boolean)
              .join(" · ");
            return (
              <li key={item.id} id={`claim-${item.id}`}>
                <p className="hero-proof-kicker">{EVIDENCE_TIER[item.kind]}</p>
                <p className="metric-row-line">
                  <span className="metric-row">{item.label}</span>
                  <a
                    className="claim-dagger"
                    href={`#claim-note-${item.id}`}
                    aria-label={`How ${item.label} was measured`}
                  >
                    <sup>{index + 1}</sup>
                  </a>
                </p>
                <EvidenceMeta note={note} kind={item.kind} />
              </li>
            );
          })}
        </ul>
        <ol className="hero-claim-notes" data-testid="hero-claim-notes">
          {proof.map((item, index) => (
            <li key={item.id} id={`claim-note-${item.id}`}>
              <span className="claim-note-mark">{index + 1}.</span>{" "}
              {item.method || item.sample || item.caveat}
              {item.baseline ? ` Baseline: ${item.baseline}.` : ""}{" "}
              <a href={`#claim-${item.id}`} className="claim-backlink">
                Back to {item.label}
              </a>
            </li>
          ))}
        </ol>
        <div className="hero-cta-block px-4 pb-5 sm:px-6">
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
      </div>
    </div>
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
      <RecruiterNav stamp="c50" />
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
          <ExternalLink
            href={`https://${resumeData.github}`}
            rel="me noopener noreferrer"
          >
            GitHub
          </ExternalLink>
          <span aria-hidden="true"> · </span>
          <ExternalLink
            href={`https://${resumeData.linkedin}`}
            rel="me noopener noreferrer"
          >
            LinkedIn
          </ExternalLink>
        </p>
        <p className="mt-4">
          <a href="/" className="paper-hit">
            ← {BROADSHEET.homeLink}
          </a>
        </p>
      </div>
    </header>
  );
}
