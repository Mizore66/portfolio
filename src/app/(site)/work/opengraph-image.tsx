import { IDENTITY } from "@/content/site/identity";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Selected work by Anas Qumhiyeh, AI Engineer at Deriv.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ kicker: `${IDENTITY.displayName} · ${IDENTITY.currentRole.title}, ${IDENTITY.currentRole.employer}`, title: "Selected work" });
}
