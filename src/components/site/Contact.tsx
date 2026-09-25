import type { Identity } from "@/content/site/types";
import { CopyEmailButton } from "./CopyEmailButton";

export function Contact({ identity }: { identity: Identity }) {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <h2 id="contact-title">{identity.contactHeading}</h2>
      <p>{identity.availability}</p>
      <ul className="inline-list">
        <li>{identity.location}</li>
        {identity.status.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      <p className="note">{identity.responseTime}</p>
      <p className="contact-lines">
        <span className="claim-value">{identity.email}</span>
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
      </div>
      <p className="resume-links">
        Résumé as PDF: <a href="/print-edition">US Letter</a> or <a href="/print-edition?paper=a4">A4</a>
      </p>
    </section>
  );
}
