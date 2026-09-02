"use client";

import { useEffect, useState } from "react";
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
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 359px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <nav data-testid="recruiter-nav" aria-label="Primary" className="recruiter-nav">
      <ul className="recruiter-nav-list">
        {compact
          ? PRIMARY.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="recruiter-nav-link">
                  {link.label}
                </a>
              </li>
            ))
          : ALL.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="recruiter-nav-link">
                  {link.label}
                </a>
              </li>
            ))}
        {compact ? (
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
        ) : null}
      </ul>
      <a
        href={BROADSHEET.paperHref}
        className="recruiter-nav-stamp"
        aria-label="Open the chess-engine career story (C50)"
      >
        C50
      </a>
    </nav>
  );
}
