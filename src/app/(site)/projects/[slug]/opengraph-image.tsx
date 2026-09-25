import { ImageResponse } from "next/og";
import { projectBySlug } from "@/content/site";
import { CATEGORY_LABEL, PROJECTS } from "@/content/site/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Case study by Anas Qumhiyeh";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

const INK = "#14181D";
const MUTED = "#4A5561";
const LIGHT = "#E4E8EC";
const DARK = "#7D8A99";
const VIOLET = "#6D3FD6";

/** Drawn from content (brief §2.3, §3.8): name, subtitle, category. No year. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = projectBySlug((await params).slug);
  const name = p?.name ?? "Case study";
  const subtitle = p?.subtitle ?? "";
  const category = p ? CATEGORY_LABEL[p.category] : "";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFFFFF", color: INK }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1, padding: "72px 80px" }}>
          <div style={{ display: "flex", fontSize: 30, color: MUTED }}>Anas Qumhiyeh · Case study</div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 92, fontWeight: 600, letterSpacing: -2, lineHeight: 1.05 }}>{name}</div>
            <div style={{ display: "flex", fontSize: 40, color: MUTED, marginTop: 20 }}>{subtitle}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: 28, color: VIOLET }}>
            <div style={{ display: "flex", width: 48, height: 4, background: VIOLET, marginRight: 20 }} />
            {category}
          </div>
        </div>
        {/* A strip of board squares: the site's one decorative motif, drawn, not an image. */}
        <div style={{ display: "flex", flexDirection: "column", width: 150 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} style={{ display: "flex", flex: 1, background: i % 2 ? DARK : LIGHT }} />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
