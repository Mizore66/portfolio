import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** A 4×4 corner of the board in tournament green and buff, with one square in ink. */
export default function Icon() {
  const LIGHT = "#E8E2C9";
  const DARK = "#3B6A4B";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexWrap: "wrap", border: "2px solid #161B19", background: LIGHT }}>
        {Array.from({ length: 16 }, (_, i) => {
          const r = Math.floor(i / 4);
          const f = i % 4;
          const fill = i === 6 ? "#161B19" : (r + f) % 2 ? DARK : LIGHT;
          return <div key={i} style={{ display: "flex", width: 7, height: 7, background: fill }} />;
        })}
      </div>
    ),
    { ...size },
  );
}
