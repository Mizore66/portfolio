import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
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
      <div className="border-b-2 border-ink px-4 py-5 sm:px-6">
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(2.15rem,6.4vw,4.5rem)] leading-[0.95] tracking-tight text-ink">
            Anas T. Qumhiyeh
          </h1>
          <p data-testid="masthead-role" className="mt-2 font-display text-[16px] italic leading-snug text-book-blue">
            {BROADSHEET.dek}
          </p>
          <p className="mt-2 font-display text-xl italic text-faded sm:text-2xl">
            Opening Preparation
          </p>
          <div className="masthead-contacts mt-4" data-testid="masthead-contacts">
            <a className="masthead-chip" href={`mailto:${resumeData.email}`}>
              {resumeData.email}
            </a>
            <a
              className="masthead-chip"
              href={`https://${resumeData.github}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              className="masthead-chip"
              href={`https://${resumeData.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a className="masthead-chip" href={BROADSHEET.printHref}>
              {BROADSHEET.printEdition}
            </a>
          </div>
          <p className="read-hint-desktop mt-2 hidden font-mono text-[12px] text-faded min-[980px]:block">
            {BROADSHEET.readHintDesktop}
          </p>
          <p className="read-hint-touch mt-2 font-mono text-[12px] text-faded min-[980px]:hidden">
            {BROADSHEET.readHintTouch}
          </p>
        </div>
      </div>
    </header>
  );
}
