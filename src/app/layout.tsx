import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anas Qumhiyeh | Software Engineer — MLOps & Full-Stack",
  description:
    "Portfolio of Anas Tarek Qumhiyeh — Software Engineer specializing in MLOps, Data Pipelines, and Full-Stack development. Experience with AWS, Kubernetes, and AI Infrastructure.",
  keywords: [
    "Software Engineer",
    "MLOps",
    "Full-Stack",
    "Data Pipelines",
    "AWS",
    "Kubernetes",
    "AI Infrastructure",
    "React",
    "Next.js",
    "Python",
  ],
  authors: [{ name: "Anas Tarek Qumhiyeh" }],
  openGraph: {
    title: "Anas Qumhiyeh | Software Engineer",
    description:
      "Software Engineer specializing in MLOps, Data Pipelines, and Full-Stack development.",
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
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
