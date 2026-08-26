import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6eedc",
          color: "#1e3a72",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: -0.5,
          border: "2px solid #1a120c",
        }}
      >
        C50
      </div>
    ),
    { ...size },
  );
}
