import { redirect, permanentRedirect } from "next/navigation";
import { lookupPublishedRedirect } from "@/lib/cms/load-redirects";
import type { CmsRedirect } from "@/lib/cms/types";

export async function publishedRedirectFor(pathname: string): Promise<CmsRedirect | null> {
  return lookupPublishedRedirect(pathname);
}

export function followRedirect(hit: CmsRedirect): never {
  if (hit.status === 301 || hit.status === 308) permanentRedirect(hit.to);
  redirect(hit.to);
}
