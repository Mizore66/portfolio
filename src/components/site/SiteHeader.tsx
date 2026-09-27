import Link from "next/link";
import { IDENTITY } from "@/content/site/identity";

// Overview, portfolio, profile, journal (brief §6, from PX PUSH's separate pages). Contact is the home page's ending.
const NAV = [
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Lab", href: "/lab" },
  { label: "Contact", href: "/#contact" },
] as const;

export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Link href="/" className="site-name">
        {IDENTITY.displayName}
      </Link>
      <nav aria-label="Primary" className="site-nav">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      {/* Outside the section nav so it can share the name's row on phones. */}
      <a href="/print-edition" className="site-resume">
        Résumé
      </a>
    </header>
  );
}
