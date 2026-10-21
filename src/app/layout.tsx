import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { connection } from "next/server";
import { Analytics } from "@vercel/analytics/next";
import { content } from "@/content/site";
import { SITE_URL } from "@/lib/site";
import { card } from "@/lib/cards";
import { Shell } from "@/components/shell/Shell";
import "./globals.css";

// Self-hosted subsets of the official variable fonts (SIL OFL 1.1, see /licenses).
// The type the site sets is in a cut of its own, preloaded: Latin-1 and punctuation, weights 400-900, widths
// 100-112 (55 KB, from 117). Lighthouse's phone counts every byte before the name paints. It has no fallback of
// its own (the full font's, below, has the same metrics), so a glyph outside it (the Ł of a player's name) falls
// through to the full font, which covers only what the cut does not (its unicode-range) and is fetched only if a page needs it.
const archivoFirst = localFont({
  src: "./fonts/Archivo-First.woff2", weight: "400 900", style: "normal",
  variable: "--font-archivo-first",
  display: "swap",
  adjustFontFallback: false,
  declarations: [{ prop: "font-stretch", value: "100% 112%" }],
});
const archivo = localFont({
  src: "./fonts/Archivo.woff2", weight: "100 900", style: "normal",
  variable: "--font-archivo",
  display: "swap",
  preload: false,
  declarations: [{ prop: "font-stretch", value: "62% 125%" }, { prop: "unicode-range", value: "U+0100-200F, U+2028-202F, U+203B-218F, U+2194-2211, U+2213-FFFF" }],
});
// The colophon's specimen sweeps both axes end to end (wght 100, wdth 62): the whole font, under its own name.
const archivoFull = localFont({
  src: "./fonts/Archivo.woff2", weight: "100 900", style: "normal",
  variable: "--font-archivo-full",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});
// The italic is its own family, not preloaded: only two Lab lines and the colophon's specimen use it, and on the
// first load its 132 KB came down alongside the hero's scripts (phase 6: the 2.5 s load budget on fast 4G).
const archivoItalic = localFont({
  src: "./fonts/Archivo-Italic.woff2", weight: "100 900", style: "italic",
  variable: "--font-archivo-italic",
  display: "swap",
  preload: false,
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
});
// The mono stays preloaded: the hero's evaluation line uses it, so the page fetches it before its first paint either
// way, and found in the CSS rather than preloaded it counted as render-blocking (Lighthouse's phone FCP, 0.9 s to 1.2 s).
// Cut the same way: Latin-1, weights 400-500 (33 KB, from 53); the full font behind it for anything else.
const jetbrainsFirst = localFont({ src: "./fonts/JetBrainsMono-First.woff2", weight: "400 500", variable: "--font-jetbrains-first", display: "swap", adjustFontFallback: false });
const jetbrains = localFont({ src: "./fonts/JetBrainsMono.woff2", weight: "100 800", variable: "--font-jetbrains", display: "swap", preload: false, declarations: [{ prop: "unicode-range", value: "U+0100-200F, U+2028-202F, U+203B-218F, U+2194-2211, U+2213-FFFF" }] });

const SITE_TITLE = content.metadata.siteTitle.replace(" — ", ", ");
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: "%s · Anas Qumhiyeh" },
  description: content.metadata.siteDescription,
  // the home page's card; the Lab, the project and the role pages set their own, and the résumé and 404 use this one
  ...card("home", { title: SITE_TITLE, description: content.metadata.siteDescription, alt: `${content.identity.displayName}. ${content.identity.heroHeadline}`, path: "/" }),
};

// "only light": the design is paper and ink, and a browser's forced dark mode (Samsung Internet's, Chrome's) would turn the
// type white while the 3D scenes, which it cannot repaint, stay light: white on white in the Roles hall.
export const viewport: Viewport = { themeColor: "#f3f3f1", colorScheme: "only light" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Every page carries a per-request CSP nonce (src/proxy.ts), which only dynamic rendering can apply.
  await connection();
  return (
    <html lang="en-GB" className={`${archivoFirst.variable} ${archivo.variable} ${archivoFull.variable} ${archivoItalic.variable} ${jetbrainsFirst.variable} ${jetbrains.variable}`}>
      <body>
        <Shell sound={(content.pageCopy as unknown as { sound: { off: string; on: string } }).sound}>{children}</Shell>
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
