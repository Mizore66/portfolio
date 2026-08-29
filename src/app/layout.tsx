import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { DeskCollage } from "@/components/opening/DeskCollage";
import { FontLoader } from "@/components/opening/FontLoader";
import { personJsonLd, META_DESCRIPTION } from "@/lib/person";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Anas T. Qumhiyeh — Opening Preparation",
  description: META_DESCRIPTION,
  keywords: [
    "Software Engineer",
    "MLOps",
    "Full-Stack",
    "Anas Qumhiyeh",
    "Opening Preparation",
    "chess",
  ],
  authors: [{ name: "Anas Tarek Qumhiyeh" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Anas T. Qumhiyeh — Opening Preparation",
    description: META_DESCRIPTION,
    type: "website",
    url: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#f6eedc",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="relative z-[1] min-h-screen bg-transparent font-lora text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        />
        <FontLoader />
        <DeskCollage />
        {children}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
