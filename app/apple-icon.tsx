import { ImageResponse } from "next/og";

export const dynamic = "force-static"; // required for the static export
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Home-screen icon for iPhone and iPad: the GM mark on the site background.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d12",
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: -4,
        }}
      >
        <span style={{ color: "#e8eaf0" }}>G</span>
        <span style={{ color: "#8f91ff" }}>M</span>
      </div>
    ),
    size,
  );
}
