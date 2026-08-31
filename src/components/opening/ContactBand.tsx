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
      <p className="band-kicker">Contact</p>
      <h2 id="contact-heading" className="band-title">
        {POSITIONING.availability}
      </h2>
      <p className="mt-2 font-display text-[16px] italic text-faded">{POSITIONING.graduateNote}</p>
      <p className="mt-4 max-w-[68ch] font-lora text-[16px] leading-[1.7] text-ink">{POSITIONING.closer}</p>
      <ul className="masthead-contacts mt-6 list-none p-0">
        <li>
          <a className="masthead-chip" href={`mailto:${resumeData.email}`}>
            Email
          </a>
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
          <a
            className="masthead-chip external-mark"
            href={`https://${resumeData.github}`}
            target="_blank"
            rel="me noopener noreferrer"
          >
            GitHub
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
