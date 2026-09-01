import { BROADSHEET } from "@/content/opening";

const PRIMARY = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
] as const;

const MORE = [
  { href: "/#lab", label: "Lab" },
  { href: "/#about", label: "About" },
  { href: BROADSHEET.printHref, label: BROADSHEET.resumeLabel },
] as const;

const ALL = [...PRIMARY.slice(0, 3), ...MORE, PRIMARY[3]] as const;

export function RecruiterNav() {
  return (
    <nav data-testid="recruiter-nav" aria-label="Primary" className="recruiter-nav">
      <ul className="recruiter-nav-list recruiter-nav-full">
        {ALL.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="recruiter-nav-link">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <ul className="recruiter-nav-list recruiter-nav-compact">
        {PRIMARY.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="recruiter-nav-link">
              {link.label}
            </a>
          </li>
        ))}
        <li className="nav-more">
          <details>
            <summary className="recruiter-nav-link">More</summary>
            <ul>
              {MORE.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="recruiter-nav-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        </li>
      </ul>
      <a href={BROADSHEET.paperHref} className="recruiter-nav-stamp">
        C50
      </a>
    </nav>
  );
}
