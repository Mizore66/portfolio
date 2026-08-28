import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Libre_Baskerville, Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { DeskCollage } from "@/components/opening/DeskCollage";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const display = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
  preload: false,
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
});

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
    <html
      lang="en"
      className={`${display.variable} ${lora.variable} ${mono.variable}`}
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/newsprint-grain.avif"
          type="image/avif"
          fetchPriority="high"
        />
      </head>
      <body className="relative z-[1] min-h-screen bg-transparent font-lora text-ink antialiased">
        <DeskCollage />
        {children}
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
