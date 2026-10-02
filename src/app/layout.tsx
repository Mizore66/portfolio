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
const archivo = localFont({
  src: "./fonts/Archivo.woff2", weight: "100 900", style: "normal",
  variable: "--font-archivo",
  display: "swap",
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
const jetbrains = localFont({ src: "./fonts/JetBrainsMono.woff2", weight: "100 800", variable: "--font-jetbrains", display: "swap" });

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
export const viewport: Viewport = { themeColor: "#f3f3f1", colorScheme: "light dark" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Every page carries a per-request CSP nonce (src/proxy.ts), which only dynamic rendering can apply.
  await connection();
  return (
    <html lang="en-GB" className={`${archivo.variable} ${archivoItalic.variable} ${jetbrains.variable}`}>
      <body>
        <Shell sound={(content.pageCopy as unknown as { sound: { off: string; on: string } }).sound}>{children}</Shell>
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
