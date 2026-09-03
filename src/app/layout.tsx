import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { DeskCollage } from "@/components/opening/DeskCollage";
import { FontLoader } from "@/components/opening/FontLoader";
import { NewspaperPieceSprite } from "@/components/opening/NewspaperPiece";
import { getPublishedDocument } from "@/lib/cms/store";
import { personJsonLd, websiteJsonLd, META_DESCRIPTION } from "@/lib/person";
import { HOME_TITLE } from "@/lib/opening/tree";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: HOME_TITLE,
  description: META_DESCRIPTION,
  keywords: [
    "Software Engineer",
    "payment systems",
    "laboratory telemetry",
    "retrieval",
    "Anas Qumhiyeh",
    "Opening Preparation",
    "chess",
  ],
  authors: [{ name: "Anas Tarek Qumhiyeh" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: META_DESCRIPTION,
    type: "website",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: META_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6eedc",
  colorScheme: "light",
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await getPublishedDocument();
  return (
    <html lang="en-GB">
      <body className="relative z-[1] min-h-screen bg-transparent font-lora text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              personJsonLd({ jobTitle: site.profile.dek, location: site.profile.location }),
            ),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        <FontLoader />
        <NewspaperPieceSprite />
        <DeskCollage />
        {children}
        <p className="print-sheet-mark" aria-hidden="true">
          Opening Preparation
        </p>
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
