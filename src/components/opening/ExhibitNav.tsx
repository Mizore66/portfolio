import Link from "next/link";
import { overlayProjects } from "@/lib/cms/overlay";
import { getRenderableDocument } from "@/lib/cms/store";
import { resumeData } from "@/lib/data";
import { exhibitHref, exhibitTitle, workHomeHref, type WorkPath } from "@/lib/metrics";

export async function ExhibitNav({ slug, path = "all" }: { slug: string; path?: WorkPath | "all" }) {
  const doc = await getRenderableDocument();
  const projects = overlayProjects(resumeData.projects, doc);
  const i = projects.findIndex((p) => p.slug === slug);
  const prev = i > 0 ? projects[i - 1] : undefined;
  const next = i >= 0 && i < projects.length - 1 ? projects[i + 1] : undefined;

  return (
    <nav className="exhibit-site-nav" aria-label="Exhibit">
      <p className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12px] uppercase tracking-widest">
        <Link href="/" className="exhibit-hit text-book-blue underline decoration-2 underline-offset-4">
          Home
        </Link>
        <Link href={workHomeHref(path)} className="exhibit-hit text-book-blue underline decoration-2 underline-offset-4">
          Work
        </Link>
        <Link href="/#experience" className="exhibit-hit text-book-blue underline decoration-2 underline-offset-4">
          Experience
        </Link>
        <Link href="/#contact" className="exhibit-hit text-book-blue underline decoration-2 underline-offset-4">
          Contact
        </Link>
      </p>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-mono text-[12px] uppercase tracking-widest">
        {prev ? (
          <Link
            href={exhibitHref(prev.slug, path)}
            className="exhibit-next exhibit-hit text-book-blue underline decoration-2 underline-offset-4"
            aria-label={`Previous: ${exhibitTitle(prev)}`}
          >
            ← <span className="exhibit-next-short">{prev.name}</span>
            <span className="exhibit-next-full"> {exhibitTitle(prev)}</span>
          </Link>
        ) : null}
        {next ? (
          <Link
            href={exhibitHref(next.slug, path)}
            className="exhibit-next exhibit-hit text-book-blue underline decoration-2 underline-offset-4"
            aria-label={`Next: ${exhibitTitle(next)}`}
          >
            <span className="exhibit-next-short">{next.name}</span>
            <span className="exhibit-next-full">{exhibitTitle(next)}</span> →
          </Link>
        ) : null}
      </p>
    </nav>
  );
}
