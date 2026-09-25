import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/** Shared 1200×630 preview image in the site palette (brief §2.3, §3.8): drawn from content, no photos, no year. */

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#14181D";
const MUTED = "#4A5561";
const LIGHT = "#E4E8EC";
const DARK = "#7D8A99";
const VIOLET = "#6D3FD6";

async function fonts() {
  const dir = join(process.cwd(), "src/fonts/schibsted-grotesk");
  const [regular, semibold] = await Promise.all([
    readFile(join(dir, "SchibstedGrotesk-Regular.ttf")),
    readFile(join(dir, "SchibstedGrotesk-SemiBold.ttf")),
  ]);
  return [
    { name: "Schibsted Grotesk", data: regular, weight: 400 as const, style: "normal" as const },
    { name: "Schibsted Grotesk", data: semibold, weight: 600 as const, style: "normal" as const },
  ];
}

export async function renderOg({ kicker, title, subtitle, footer }: { kicker: string; title: string; subtitle?: string; footer?: string }) {
  const long = title.length > 48;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFFFF", color: INK, fontFamily: "Schibsted Grotesk" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "68px 76px" }}>
          <div style={{ display: "flex", fontSize: 30, color: MUTED }}>{kicker}</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: long ? 60 : 88, fontWeight: 600, letterSpacing: -1.5, lineHeight: 1.06 }}>{title}</div>
            {subtitle ? <div style={{ display: "flex", fontSize: 38, color: MUTED, marginTop: 22 }}>{subtitle}</div> : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: VIOLET }}>
            <div style={{ display: "flex", width: 48, height: 4, background: VIOLET, marginRight: 20 }} />
            {footer ?? "anasqumhiyeh.dev"}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: 150 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ display: "flex", flex: 1, background: i % 2 ? DARK : LIGHT }} />
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
