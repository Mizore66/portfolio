import { ledgerRedirects, matchRedirect } from "@/lib/cms/redirects";
import type { CmsRedirect } from "@/lib/cms/types";

let cache: { at: number; rows: CmsRedirect[] } | null = null;
const TTL_MS = 15_000;

export async function cachedPublishedRedirects(): Promise<CmsRedirect[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.rows;
  try {
    const { getPublishedDocument } = await import("@/lib/cms/store");
    const rows = (await getPublishedDocument()).redirects ?? ledgerRedirects();
    cache = { at: Date.now(), rows };
    return rows;
  } catch {
    return ledgerRedirects();
  }
}

export async function lookupPublishedRedirect(pathname: string): Promise<CmsRedirect | null> {
  return matchRedirect(pathname, await cachedPublishedRedirects());
}
