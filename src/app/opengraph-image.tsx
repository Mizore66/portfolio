import { ImageResponse } from "next/og";

export const alt = "Anas T. Qumhiyeh — software engineer, ML infrastructure and data-intensive systems";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f6eedc";
const INK = "#1a120c";
const BLUE = "#1e3a72";
const RED = "#8b241c";
const LIGHT = "#e8dcc4";
const DARK = "#8f8574";
const FADED = "#4a3f34";

export default function Image() {
  const squares = [];
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const dark = (f + r) % 2 === 1;
      squares.push(
        <div
          key={`${r}-${f}`}
          style={{
            width: 22,
            height: 22,
            background: dark ? DARK : LIGHT,
            display: "flex",
          }}
        />,
      );
    }
  }

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
              borderBottom: `2px solid ${INK}`,
              paddingBottom: 10,
              fontSize: 16,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: FADED,
            }}
          >
            C50 · Italian Game · Vol. 2026 · Moves are facts
          </div>
          <div style={{ display: "flex", flex: 1, marginTop: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1, marginRight: 36 }}>
              <div style={{ display: "flex", fontSize: 64, lineHeight: 0.95, color: INK, fontWeight: 700 }}>
                Anas T. Qumhiyeh
              </div>
              <div style={{ display: "flex", marginTop: 16, fontSize: 28, color: INK }}>
                Software engineer
              </div>
              <div style={{ display: "flex", marginTop: 8, fontSize: 22, color: BLUE }}>
                ML infrastructure · Data systems
              </div>
              <div style={{ display: "flex", marginTop: 22, fontSize: 18, fontStyle: "italic", color: FADED }}>
                Opening Preparation — C50
              </div>
              <div style={{ display: "flex", marginTop: 10, fontSize: 16, color: RED }}>
                5. d4!! · The Central Break
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                width: 176,
                height: 176,
                border: `3px solid ${INK}`,
                alignSelf: "center",
              }}
            >
              {squares}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
