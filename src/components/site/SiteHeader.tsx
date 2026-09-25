import Link from "next/link";
import { IDENTITY } from "@/content/site/identity";

const NAV = [
  { label: "Work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Lab", href: "/#lab" },
  { label: "About", href: "/#about" },
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
        <a href="/print-edition" className="site-resume">
          Résumé
        </a>
      </nav>
    </header>
  );
}
