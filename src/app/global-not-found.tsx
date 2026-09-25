import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { FONT_VARIABLES } from "./(site)/fonts";
import "./(site)/site.css";

export const metadata: Metadata = {
  title: "Correction · Anas Qumhiyeh",
  description: "The page you requested was a misprint. The front page still holds the work.",
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en-GB" className={FONT_VARIABLES}>
      <body>
        <SiteHeader />
        <main id="main" className="reading not-found" data-testid="correction" aria-labelledby="not-found-title">
          <h1 id="not-found-title" className="hero-statement">
            The page you requested was a misprint.
          </h1>
          <p className="hero-subline">The front page still holds the work.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary" href="/">
              Back to the front page
            </Link>
            <a className="btn" href="/print-edition">
              Résumé
            </a>
            <Link className="btn" href="/#contact">
              Contact
            </Link>
          </div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
