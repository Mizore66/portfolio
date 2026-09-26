import { LINE_ECO, LINE_NAME } from "@/content/site/line";
import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Opening Preparation: a playable career timeline told through an Italian Game.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({ kicker: "Anas Qumhiyeh · The annotated career", title: "Opening Preparation", subtitle: "A playable career timeline told through an Italian Game.", footer: `${LINE_NAME} (${LINE_ECO})` });
}
