import { notFound } from "next/navigation";
import { followRedirect, publishedRedirectFor } from "@/lib/cms/follow-redirect";

export default async function ArchiveRedirect() {
  const hit = await publishedRedirectFor("/archive");
  if (!hit) notFound();
  followRedirect(hit);
}
