import { Schibsted_Grotesk } from "next/font/google";
import localFont from "next/font/local";

// One family for text and notation (docs/upgrade/phase-1-visual-system.md §2.2): roman for facts, italic for commentary.
const sans = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "500"], style: "normal", variable: "--font-sans-src", display: "swap" });
// Commentary is in most pages' first HTML, so its italic is on the critical path to first paint: it is the
// variable italic instanced at 400, the only weight commentary uses (25 KB instead of 48), and preloaded.
const voice = localFont({
  src: [{ path: "../../fonts/schibsted-grotesk/schibsted-grotesk-italic-400-latin.woff2", weight: "400", style: "italic" }],
  variable: "--font-voice-src",
  display: "swap",
});
// Noto Sans Symbols 2 cut to the twelve chess pieces: 3 KB instead of the 235 KB "symbols" subset.
const chess = localFont({
  src: [{ path: "../../fonts/noto-sans-symbols-2/noto-sans-symbols-2-chess.woff2", weight: "400", style: "normal" }],
  variable: "--font-chess-src",
  display: "swap",
});
const mono = localFont({
  src: [{ path: "../../fonts/commit-mono/commit-mono-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-mono-src",
  display: "swap",
  // Mono sets figures and metadata, never the first-viewport text: fetched on use, not preloaded.
  preload: false,
});

/** Shared by the (site) layout and the global 404, which has no layout of its own. */
export const FONT_VARIABLES = `${sans.variable} ${voice.variable} ${chess.variable} ${mono.variable}`;
