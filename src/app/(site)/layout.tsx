import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Literata, Noto_Sans_Symbols_2, Schibsted_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteJsonLd } from "@/components/site/SiteJsonLd";
import { personSchema, websiteSchema } from "@/content/site/schema";
import { SITE_URL } from "@/lib/site";
import "./site.css";

const sans = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-sans-src", display: "swap" });
const voice = Literata({ subsets: ["latin"], style: ["italic"], weight: ["400"], variable: "--font-voice-src", display: "swap" });
const chess = Noto_Sans_Symbols_2({ subsets: ["symbols"], weight: "400", variable: "--font-chess-src", display: "swap" });
const mono = localFont({
  src: [{ path: "../../fonts/commit-mono/commit-mono-latin-400-normal.woff2", weight: "400", style: "normal" }],
  variable: "--font-mono-src",
  display: "swap",
});

const TITLE = "Anas Qumhiyeh — Software engineer";
const DESCRIPTION =
  "Anas Qumhiyeh, AI Engineer at Deriv. Production services in Go, TypeScript and Python: AI support systems, payments, and graph retrieval.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  authors: [{ name: "Anas Tarek Qumhiyeh" }],
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, type: "website", url: SITE_URL },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export const viewport: Viewport = { themeColor: "#FFFFFF", colorScheme: "light" };

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${sans.variable} ${voice.variable} ${chess.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
        <SiteJsonLd data={personSchema()} />
        <SiteJsonLd data={websiteSchema()} />
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
