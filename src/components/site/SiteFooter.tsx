import { IDENTITY } from "@/content/site/identity";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>{IDENTITY.legalName}</p>
      <p>
        <a href="/colophon">How this site was made</a> · <a href="/opening-preparation">The annotated career</a>
      </p>
    </footer>
  );
}
