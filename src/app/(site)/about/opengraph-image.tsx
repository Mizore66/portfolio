import { IDENTITY } from "@/content/site/identity";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = `${IDENTITY.displayName}: ${IDENTITY.availability}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ kicker: `${IDENTITY.currentRole.title}, ${IDENTITY.currentRole.employer}`, title: IDENTITY.displayName, subtitle: IDENTITY.availability });
}
