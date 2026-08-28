"use client";

import { IBM_Plex_Mono, Libre_Baskerville, Lora } from "next/font/google";

const display = Libre_Baskerville({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  preload: false,
});

const lora = Lora({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: "400",
  variable: "--font-lora",
  display: "swap",
  preload: false,
});

const mono = IBM_Plex_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export function loadFonts() {
  document.documentElement.classList.add(display.variable, lora.variable, mono.variable);
}
