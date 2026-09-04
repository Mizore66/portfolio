import { redirect, permanentRedirect } from "next/navigation";
import { matchRedirect } from "@/lib/cms/redirects";
import { getPublishedDocument } from "@/lib/cms/store";
import type { CmsRedirect } from "@/lib/cms/types";

export async function publishedRedirectFor(pathname: string): Promise<CmsRedirect | null> {
  const doc = await getPublishedDocument();
  return matchRedirect(pathname, doc.redirects ?? []);
}

export function followRedirect(hit: CmsRedirect): never {
  if (hit.status === 301 || hit.status === 308) permanentRedirect(hit.to);
  redirect(hit.to);
}
