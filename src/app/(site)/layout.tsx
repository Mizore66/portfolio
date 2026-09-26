import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { AnalyticsEvents } from "@/components/site/AnalyticsEvents";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteJsonLd } from "@/components/site/SiteJsonLd";
import { MotionRuntime } from "@/components/motion/MotionRuntime";
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

export const viewport: Viewport = { themeColor: "#F1F2EC", colorScheme: "light" };

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
        <AnalyticsEvents />
        <Suspense fallback={null}>
          <MotionRuntime />
        </Suspense>
      </body>
    </html>
  );
}
