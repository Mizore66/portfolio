import { notFound } from "next/navigation";
import { followRedirect, publishedRedirectFor } from "@/lib/cms/follow-redirect";

export default async function CatchAllRedirect({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const pathname = `/${path.join("/")}`;
  const hit = await publishedRedirectFor(pathname);
  if (!hit) notFound();
  followRedirect(hit);
}
