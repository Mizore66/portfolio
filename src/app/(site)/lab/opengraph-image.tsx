import { IDENTITY } from "@/content/site/identity";
import { LAB_TEASER } from "@/content/site/lab";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = `${IDENTITY.displayName}'s lab: ${LAB_TEASER.headline}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ kicker: `${IDENTITY.displayName} · Lab`, title: LAB_TEASER.headline, footer: LAB_TEASER.meta });
}
