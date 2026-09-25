import { ImageResponse } from "next/og";
import { resumeData } from "@/lib/data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Patent sheet — Opening Preparation exhibit";

const PAPER = "#f6eedc";
const INK = "#1a120c";
const BLUE = "#1e3a72";
const RED = "#8b241c";
const FADED = "#4a3f34";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = resumeData.projects.find((p) => p.slug === slug);
  const name = project?.name ?? "Exhibit";
  const fn = project?.patent.function ?? "THE APPARATUS";
  const filed = project?.patent.filed ?? "";
  const move = project?.patent.move ?? "";
  const sheets = project?.patent.sheets ?? 2;
  const sheet = project?.patent.sheet ?? 1;

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
            padding: "24px 40px 32px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 16,
              color: FADED,
            }}
          >
            <span>(No Model.)</span>
            <span>{`${sheets} Sheets—Sheet ${sheet}.`}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 12,
              fontSize: 18,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: INK,
            }}
          >
            ANAS T. QUMHIYEH.
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 8,
              fontSize: 22,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: BLUE,
            }}
          >
            {`APPARATUS FOR ${fn}.`}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
              paddingBottom: 12,
              borderBottom: `2px solid ${INK}`,
              fontSize: 16,
              color: FADED,
            }}
          >
            <span>{`No. ${move}.`}</span>
            <span>{`Filed ${filed}.`}</span>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", fontSize: 56, lineHeight: 1, color: INK, fontWeight: 700 }}>
              {name}
            </div>
            <div style={{ display: "flex", marginTop: 16, fontSize: 24, fontStyle: "italic", color: RED }}>
              {project?.subtitle ?? "Exhibit"}
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 16,
                fontSize: 20,
                color: INK,
                textAlign: "center",
                maxWidth: 920,
                lineHeight: 1.35,
              }}
            >
              {project?.purpose ?? ""}
            </div>
            <div style={{ display: "flex", marginTop: 20, fontSize: 20, color: FADED }}>
              Opening Preparation · the scoresheet
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
