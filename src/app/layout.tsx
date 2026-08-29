import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { DeskCollage } from "@/components/opening/DeskCollage";
import { FontLoader } from "@/components/opening/FontLoader";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Anas T. Qumhiyeh — Opening Preparation",
  description:
    "An annotated Italian Game: the portfolio of Anas Tarek Qumhiyeh, software engineer. Moves are facts. Annotations are voice.",
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
    description:
      "An annotated Italian Game: jobs as moves, the rest of a life as annotations.",
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
        <FontLoader />
        <DeskCollage />
        {children}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
