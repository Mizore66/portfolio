import type { Metadata } from "next";
import { featured } from "@/content/work";
import { WorkIndex } from "@/components/work/WorkIndex";

export const metadata: Metadata = { title: "Work", description: featured.map((f) => `${f.name}: ${f.subtitle}`).join(". ") + "." };

export default function Page() {
  return <WorkIndex pieces={featured.map((f) => ({ slug: f.slug, name: f.name, square: f.square, move: f.move, result: f.result, qualifier: f.claim.qualifier }))} />;
}
