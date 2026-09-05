import { CopyEmail } from "@/components/opening/CopyEmail";
import { ExternalLink } from "@/components/opening/ExternalLink";
import { BROADSHEET } from "@/content/opening";
import { getRenderableDocument } from "@/lib/cms/store";
import { activeAvailability } from "@/lib/cms/ledger";
import { resumeData } from "@/lib/data";
import { POSITIONING } from "@/lib/metrics";

export async function ContactBand() {
  const site = await getRenderableDocument();
  const availability = activeAvailability(site);
  return (
    <section
      id="contact"
      data-testid="contact-band"
      className="recruiter-band"
      aria-labelledby="contact-heading"
    >
      <p className="band-kicker">Correspondence</p>
      <h2 id="contact-heading" className="band-title">
        Contact
      </h2>
      <p className="mt-2 max-w-[68ch] font-display text-[16px] italic text-faded">
        {POSITIONING.contactHed}
      </p>
      <p className="mt-3 font-mono text-[12px] uppercase tracking-[0.12em] text-faded" data-testid="contact-availability">
        {availability}
      </p>
      <p className="mt-1 font-mono text-[12px] text-faded" data-testid="contact-location">
        {site.profile.location} · open to remote
      </p>
      <p className="mt-1 font-mono text-[12px] text-faded">{POSITIONING.workAuth}</p>
      <p className="mt-2 font-mono text-[12px] text-faded">{POSITIONING.replies}</p>
      <p className="mt-4 font-mono text-[14px] text-ink" data-testid="contact-email">
        {resumeData.email}
      </p>
      <ul className="masthead-contacts mt-6 list-none p-0">
        <li>
          <a className="masthead-chip masthead-chip-primary" href={`mailto:${resumeData.email}`}>
            Email
          </a>
        </li>
        <li>
          <CopyEmail email={resumeData.email} />
        </li>
        <li>
          <ExternalLink
            className="masthead-chip"
            href={`https://${resumeData.linkedin}`}
            rel="me noopener noreferrer"
          >
            LinkedIn
          </ExternalLink>
        </li>
        <li>
          <ExternalLink
            className="masthead-chip"
            href={`https://${resumeData.github}`}
            rel="me noopener noreferrer"
          >
            GitHub
          </ExternalLink>
        </li>
        <li>
          <a className="masthead-chip" href={BROADSHEET.printHref}>
            {BROADSHEET.resumeLabel}
            <span className="ml-2 font-normal normal-case tracking-normal text-faded">
              {BROADSHEET.printEdition}
            </span>
          </a>
        </li>
        <li>
          <a className="masthead-chip" href={`${BROADSHEET.printHref}?paper=a4`}>
            A4 résumé
          </a>
        </li>
      </ul>
    </section>
  );
}
