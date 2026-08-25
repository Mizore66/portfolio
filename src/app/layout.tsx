import type { Metadata } from "next";
import { IBM_Plex_Mono, Libre_Baskerville, Lora } from "next/font/google";
import "./globals.css";

const display = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-lora",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "A. T. Qumhiyeh — Opening Preparation",
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
  openGraph: {
    title: "A. T. Qumhiyeh — Opening Preparation",
    description:
      "An annotated Italian Game: jobs as moves, the rest of a life as annotations.",
    type: "website",
  },
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
      <body className="min-h-screen font-lora text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
