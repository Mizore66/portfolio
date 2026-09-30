import type { Metadata } from "next";
import { colophonProps } from "@/content/pages";
import { Colophon } from "@/components/colophon/Colophon";
import { card } from "@/lib/cards";
import { content } from "@/content/site";

const copy = colophonProps(), TITLE = (content.metadata as unknown as { pageTitles: Record<string, string> }).pageTitles["/colophon"];
export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: copy.lede,
  ...card("colophon", { title: TITLE, description: copy.lede, alt: copy.title, path: "/colophon" }),
};

/** The colophon (phase 6, step 4): how the site was made, with its credits and licences. */
export default function Page() {
  return <Colophon copy={copy} />;
}
