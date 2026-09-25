import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteJsonLd } from "@/components/site/SiteJsonLd";
import { personSchema, websiteSchema } from "@/content/site/schema";
import { SITE_URL } from "@/lib/site";
import { FONT_VARIABLES } from "./fonts";
import "./site.css";

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
    <html lang="en-GB" className={FONT_VARIABLES}>
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
