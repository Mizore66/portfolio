import Link from "next/link";
import { resumeData } from "@/lib/data";
import { exhibitTitle } from "@/lib/metrics";

export function ExhibitNav({ slug }: { slug: string }) {
  const projects = resumeData.projects;
  const i = projects.findIndex((p) => p.slug === slug);
  const prev = i > 0 ? projects[i - 1] : undefined;
  const next = i >= 0 && i < projects.length - 1 ? projects[i + 1] : undefined;

  return (
    <nav className="exhibit-site-nav" aria-label="Exhibit">
      <p className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12px] uppercase tracking-widest">
        <Link href="/" className="text-book-blue underline decoration-2 underline-offset-4">
          Home
        </Link>
        <Link href="/#work" className="text-book-blue underline decoration-2 underline-offset-4">
          Work
        </Link>
        <Link href="/#experience" className="text-book-blue underline decoration-2 underline-offset-4">
          Experience
        </Link>
        <Link href="/#contact" className="text-book-blue underline decoration-2 underline-offset-4">
          Contact
        </Link>
      </p>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12px] uppercase tracking-widest">
        {prev ? (
          <Link
            href={`/projects/${prev.slug}`}
            className="text-book-blue underline decoration-2 underline-offset-4"
          >
            ← {exhibitTitle(prev)}
          </Link>
        ) : null}
        {next ? (
          <Link
            href={`/projects/${next.slug}`}
            className="text-book-blue underline decoration-2 underline-offset-4"
          >
            {exhibitTitle(next)} →
          </Link>
        ) : null}
      </p>
    </nav>
  );
}
