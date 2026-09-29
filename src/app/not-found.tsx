import type { Metadata } from "next";
import { content } from "@/content/site";
import { NotFound, type NotFoundCopy } from "@/components/notfound/NotFound";

export const metadata: Metadata = { title: "Not found" };

export default function NotFoundPage() {
  return <NotFound copy={(content.pageCopy as unknown as { notFound: NotFoundCopy }).notFound} />;
}
