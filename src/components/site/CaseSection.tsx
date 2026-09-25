import { CopyLinkButton } from "./CopyLinkButton";

/** A case-study section: fixed fragment id (brief §2.5) and a copy-link control on the heading. */
export function CaseSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="case-section" aria-labelledby={`${id}-title`}>
      <div className="case-heading">
        <h2 id={`${id}-title`}>{title}</h2>
        <CopyLinkButton id={id} title={title} />
      </div>
      {children}
    </section>
  );
}
