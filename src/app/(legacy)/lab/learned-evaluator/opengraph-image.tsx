import { ImageResponse } from "next/og";
import { LAB_ARTICLE } from "@/content/learned-evaluator";

export const alt = `${LAB_ARTICLE.hed} — Gate C`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f6eedc";
const INK = "#1a120c";
const RED = "#8b241c";
const FADED = "#4a3f34";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#2c1c12",
          padding: 36,
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: PAPER,
            border: `3px solid ${INK}`,
            padding: "28px 40px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: FADED,
              borderBottom: `2px solid ${INK}`,
              paddingBottom: 10,
            }}
          >
            <span>Laboratory · Gate C</span>
            <span>{LAB_ARTICLE.datePublished}</span>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 52,
                lineHeight: 1.05,
                color: INK,
                fontWeight: 700,
              }}
            >
              {LAB_ARTICLE.hed}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 20,
                fontSize: 28,
                color: RED,
              }}
            >
              {LAB_ARTICLE.result}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontSize: 20,
                fontStyle: "italic",
                color: FADED,
              }}
            >
              {LAB_ARTICLE.filed}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
