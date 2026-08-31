import { BROADSHEET } from "@/content/opening";

const LINKS = [
  { href: "#work", label: "Work" },
  { href: "#experience", label: "Experience" },
  { href: "#about", label: "About" },
  { href: BROADSHEET.printHref, label: BROADSHEET.resumeLabel },
  { href: "#contact", label: "Contact" },
] as const;

export function RecruiterNav() {
  return (
    <nav data-testid="recruiter-nav" aria-label="Primary" className="recruiter-nav">
      <ul className="recruiter-nav-list">
        {LINKS.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="recruiter-nav-link">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <a href="#the-game" className="recruiter-nav-stamp">
        C50
      </a>
    </nav>
  );
}
