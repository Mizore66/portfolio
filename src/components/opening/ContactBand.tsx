import { CopyEmail } from "@/components/opening/CopyEmail";
import { BROADSHEET } from "@/content/opening";
import { resumeData } from "@/lib/data";
import { POSITIONING } from "@/lib/metrics";

export function ContactBand() {
  return (
    <section
      id="contact"
      data-testid="contact-band"
      className="recruiter-band"
      aria-labelledby="contact-heading"
    >
      <p className="band-kicker">Correspondence</p>
      <h2 id="contact-heading" className="band-title">
        {POSITIONING.contactHed}
      </h2>
      <p className="mt-4 font-mono text-[14px] text-ink" data-testid="contact-email">
        {resumeData.email}
      </p>
      <ul className="masthead-contacts mt-6 list-none p-0">
        <li>
          <a className="masthead-chip" href={`mailto:${resumeData.email}`}>
            Email
          </a>
        </li>
        <li>
          <CopyEmail email={resumeData.email} />
        </li>
        <li>
          <a
            className="masthead-chip external-mark"
            href={`https://${resumeData.linkedin}`}
            target="_blank"
            rel="me noopener noreferrer"
          >
            LinkedIn
          </a>
        </li>
        <li>
          <a className="masthead-chip" href={BROADSHEET.printHref}>
            {BROADSHEET.resumeLabel}
            <span className="ml-2 font-normal normal-case tracking-normal text-faded">
              {BROADSHEET.printEdition}
            </span>
          </a>
        </li>
      </ul>
    </section>
  );
}
