"use client";

import Link from "next/link";
import type { Artifact } from "@/lib/opening/types";

export function ArtifactLinks({ artifacts }: { artifacts: Artifact[] }) {
  if (artifacts.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12px] uppercase tracking-wider">
      {artifacts.map((a) => {
        const external = a.href.startsWith("http") || a.href.startsWith("mailto:");
        const className =
          "artifact-link text-book-blue underline decoration-2 underline-offset-4 hover:text-score-red focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-2";
        return (
          <li key={a.href + a.label}>
            {external ? (
              <a href={a.href} className={className} target={a.href.startsWith("http") ? "_blank" : undefined} rel={a.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                {a.label}
              </a>
            ) : (
              <Link href={a.href} className={className}>
                {a.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
