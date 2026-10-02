import type { Metadata } from "next";
import { content } from "@/content/site";

/**
 * The share card for a page (phase 6, step 3, card B): public/og/<card>.jpg, the page at rest as captured by
 * scripts/cards.mjs. Metadata merges shallowly, so each page that sets a card sets its whole Open Graph block.
 */
export function card(name: string, { title, description, alt, path }: { title: string; description: string; alt: string; path: string }): Metadata {
  const images = [{ url: `/og/${name}.jpg`, width: 1200, height: 630, alt, type: "image/jpeg" }];
  return {
    openGraph: { type: "website", siteName: content.identity.displayName, locale: "en_GB", url: path, title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}
