import { IDENTITY } from "@/content/site/identity";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Anas Qumhiyeh, AI Engineer at Deriv: I like systems that have to survive measurement.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    kicker: `${IDENTITY.displayName} · ${IDENTITY.currentRole.title}, ${IDENTITY.currentRole.employer}`,
    title: IDENTITY.heroHeadline,
  });
}
