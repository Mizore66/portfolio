import { Literata, Noto_Sans_Symbols_2, Schibsted_Grotesk } from "next/font/google";
import localFont from "next/font/local";

const sans = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-sans-src", display: "swap" });
const voice = Literata({ subsets: ["latin"], style: ["italic"], weight: ["400"], variable: "--font-voice-src", display: "swap" });
const chess = Noto_Sans_Symbols_2({ subsets: ["symbols"], weight: "400", variable: "--font-chess-src", display: "swap" });
const mono = localFont({
  src: [{ path: "../../fonts/commit-mono/commit-mono-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-mono-src",
  display: "swap",
});

/** Shared by the (site) layout and the global 404, which has no layout of its own. */
export const FONT_VARIABLES = `${sans.variable} ${voice.variable} ${chess.variable} ${mono.variable}`;
