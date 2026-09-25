import type { Identity } from "@/content/site/types";
import { CopyEmailButton } from "./CopyEmailButton";

export function Contact({ identity }: { identity: Identity }) {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <p className="kicker">Contact</p>
      <h2 id="contact-title">{identity.contactHeading}</h2>
      <p>{identity.availability}</p>
      <p>
        {identity.location} · {identity.status.join(" · ")}
      </p>
      <p className="note">{identity.responseTime}</p>
      <p className="claim-value">{identity.email}</p>
      <p>
        <a href={`tel:${identity.phone.tel}`}>{identity.phone.display}</a>
      </p>
      <div className="hero-actions">
        <a className="btn btn-primary" href={`mailto:${identity.email}`}>
          Email
        </a>
        <CopyEmailButton email={identity.email} />
        <a className="btn" href={identity.linkedin} target="_blank" rel="me noopener noreferrer">
          LinkedIn<span className="sr-only"> (opens in new tab)</span>
        </a>
        <a className="btn" href={identity.github} target="_blank" rel="me noopener noreferrer">
          GitHub<span className="sr-only"> (opens in new tab)</span>
        </a>
        <a className="btn" href="/print-edition">
          Résumé (Letter)
        </a>
        <a className="btn" href="/print-edition?paper=a4">
          Résumé (A4)
        </a>
      </div>
    </section>
  );
}
