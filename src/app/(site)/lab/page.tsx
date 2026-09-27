import type { Metadata } from "next";
import Link from "next/link";
import { LabTeaser } from "@/components/site/LabTeaser";
import { PROJECTS } from "@/content/site/projects";
import { LAB_ARTICLE } from "@/content/site/lab";

export const metadata: Metadata = {
  title: "Lab · Anas Qumhiyeh",
  description: LAB_ARTICLE.description,
  alternates: { canonical: "/lab" },
  openGraph: { title: "Lab · Anas Qumhiyeh", url: "/lab" },
};

/** The journal (brief §6): the engine experiment and the lab's other write-ups, each on its own URL. */
export default function LabPage() {
  const lab = PROJECTS.filter((p) => p.group === "lab");
  return (
    <main id="main" className="reading lab-index">
      <LabTeaser headingLevel="h1" />
      <ul className="lab-list">
        <li>
          <Link href="/lab/learned-evaluator" data-cursor="piece">
            {LAB_ARTICLE.title}
          </Link>
        </li>
        {lab.map((p) => (
          <li key={p.slug}>
            <Link href={`/projects/${p.slug}`} data-cursor="piece">
              {p.name}
            </Link>{" "}
            <span className="archive-subtitle">{p.subtitle}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
