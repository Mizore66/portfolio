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
  { href: "/#lab", label: "Experiments" },
  { href: "/#about", label: "About" },
] as const;

const ALL = [...PRIMARY.slice(0, 3), ...MORE, PRIMARY[3]] as const;

export function RecruiterNav({ stamp = "resume" }: { stamp?: "resume" | "c50" }) {
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
      {stamp === "c50" ? (
        <a
          href={BROADSHEET.paperHref}
          className="recruiter-nav-stamp"
          aria-label="Opening Preparation — C50"
        >
          C50
        </a>
      ) : (
        <a href={BROADSHEET.printHref} className="recruiter-nav-stamp">
          {BROADSHEET.resumeLabel}
        </a>
      )}
    </nav>
  );
}
