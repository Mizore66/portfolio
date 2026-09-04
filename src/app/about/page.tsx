import { notFound } from "next/navigation";
import { followRedirect, publishedRedirectFor } from "@/lib/cms/follow-redirect";

export default async function AboutRedirect() {
  const hit = await publishedRedirectFor("/about");
  if (!hit) notFound();
  followRedirect(hit);
}
