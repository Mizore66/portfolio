"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BROADSHEET } from "@/content/opening";

const PRIMARY = [
  { href: "/", label: "Home", match: "home" },
  { href: "/#work", label: "Work", match: "work" },
  { href: "/#experience", label: "Experience", match: "experience" },
  { href: "/#contact", label: "Contact", match: "contact" },
] as const;

const MORE = [
  { href: "/#lab", label: "Experiments", match: "lab" },
  { href: "/#about", label: "About", match: "about" },
] as const;

const ALL = [...PRIMARY.slice(0, 3), ...MORE, PRIMARY[3]] as const;

function currentFor(pathname: string, hash: string, match: string): "page" | "location" | undefined {
  if (pathname.startsWith("/projects/") || pathname.startsWith("/lab/")) {
    return match === "work" ? "location" : undefined;
  }
  if (pathname === "/opening-preparation") return undefined;
  if (pathname !== "/") return undefined;
  const section = hash.replace(/^#/, "");
  if (match === "home" && !section) return "page";
  if (section && match === section) return "location";
  return undefined;
}

export function RecruiterNav({ stamp = "resume" }: { stamp?: "resume" | "c50" }) {
  const pathname = usePathname() ?? "/";
  const [compact, setCompact] = useState(false);
  const [hash, setHash] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 479px)");
    const apply = () => setCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const apply = () => setHash(window.location.hash);
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function linkProps(href: string, match: string) {
    const current = currentFor(pathname, hash, match);
    return {
      href,
      "aria-current": current,
    } as const;
  }

  return (
    <nav data-testid="recruiter-nav" aria-label="Primary" className="recruiter-nav">
      <ul className="recruiter-nav-list">
        {compact
          ? PRIMARY.map((link) => (
              <li key={link.href}>
                <a {...linkProps(link.href, link.match)} className="recruiter-nav-link">
                  {link.label}
                </a>
              </li>
            ))
          : ALL.map((link) => (
              <li key={link.href}>
                <a {...linkProps(link.href, link.match)} className="recruiter-nav-link">
                  {link.label}
                </a>
              </li>
            ))}
        {compact ? (
          <li className="nav-more">
            <div>
              <button
                type="button"
                className="recruiter-nav-link"
                aria-expanded={moreOpen}
                aria-controls="nav-more-menu"
                onClick={() => setMoreOpen((open) => !open)}
              >
                More
              </button>
              {moreOpen ? (
                <div id="nav-more-menu" className="nav-more-panel">
                  <p className="px-2 pb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-faded">More pages</p>
                  <p className="px-2 pb-2 font-mono text-[11px] text-faded">
                    Current: {ALL.find((link) => currentFor(pathname, hash, link.match))?.label ?? "Home"}
                  </p>
                  <ul>
                  {MORE.map((link) => (
                    <li key={link.href}>
                      <a
                        {...linkProps(link.href, link.match)}
                        className="recruiter-nav-link"
                        onClick={() => setMoreOpen(false)}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </li>
        ) : null}
      </ul>
      {stamp === "c50" ? (
        <a
          href={BROADSHEET.paperHref}
          className="recruiter-nav-stamp"
          aria-label="Opening Preparation — C50"
          aria-current={pathname === BROADSHEET.paperHref ? "page" : undefined}
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
