import { IDENTITY } from "@/content/site/identity";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>{IDENTITY.legalName}</p>
      {/* Contact stays reachable from every page (brief §6). */}
      <p className="footer-contact">
        <a href={`mailto:${IDENTITY.email}`}>{IDENTITY.email}</a> · <a href={IDENTITY.linkedin} rel="me noopener noreferrer" target="_blank">LinkedIn<span className="sr-only"> (opens in new tab)</span></a> ·{" "}
        <a href={IDENTITY.github} rel="me noopener noreferrer" target="_blank">GitHub<span className="sr-only"> (opens in new tab)</span></a> · <a href="/print-edition">Résumé</a>
      </p>
      <p>
        <a href="/colophon">How this site was made</a> · <a href="/opening-preparation">The annotated career</a>
      </p>
    </footer>
  );
}
