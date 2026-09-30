import type { Metadata } from "next";
import { content } from "@/content/site";
import { labProps } from "@/content/pages";
import { Lab } from "@/components/lab/Lab";
import { card } from "@/lib/cards";

const A = (content as unknown as { lab: { article: { description: string } } }).lab.article;
export const metadata: Metadata = { title: "Lab", description: A.description, ...card("lab", { title: "Lab · Anas Qumhiyeh", description: A.description, alt: A.description, path: "/lab" }) };

/** The full Lab: the opening, the six chapters and Play. The one page's Lab section leads here. */
export default function Page() {
  const { copy, tree } = labProps();
  return <Lab copy={copy} tree={tree} />;
}
