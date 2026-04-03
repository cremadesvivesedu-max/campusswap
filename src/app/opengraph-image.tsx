import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", height: "100%", width: "100%", background: "linear-gradient(135deg, #07111f, #123249)", color: "white", padding: "64px", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ fontSize: 32, opacity: 0.7 }}>CampusSwap</div>
        <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, maxWidth: 820 }}>Buy and sell student essentials in Maastricht.</div>
        <div style={{ fontSize: 28, opacity: 0.85 }}>Student-only, safer, affordable, and built for fast local pickup.</div>
      </div>
    ),
    size
  );
}
