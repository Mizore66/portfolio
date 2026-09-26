import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "The learned evaluator underperformed PeSTO by 143.3 ±35.4 Elo.";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    kicker: "Anas Qumhiyeh · Lab",
    title: "The learned evaluator underperformed PeSTO by 143.3 ±35.4 Elo",
    subtitle: "50,000 nodes a move, 128 games, SPRT terminated for H0.",
    footer: "A published negative result",
  });
}
