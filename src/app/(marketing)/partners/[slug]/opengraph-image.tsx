import { ImageResponse } from "next/og";
import { getPartner } from "@/features/partners/partners";

// Share image for a partner deal (WhatsApp, Instagram, LinkedIn): the shop's colour, its name and the code.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function PartnerOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = getPartner(slug);
  const color = partner?.brandColor ?? "#203860";

  return new ImageResponse(
    (
      <div style={{ display: "flex", height: "100%", width: "100%", background: color, color: "white", padding: "64px", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, opacity: 0.9 }}>CampusSwap × {partner?.name ?? "Partner"}</div>
        <div style={{ display: "flex", fontSize: 70, fontWeight: 800, lineHeight: 1.08, maxWidth: 980 }}>
          {partner?.headline.en ?? "Student deals in Maastricht"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", background: "#203860", borderRadius: 24, padding: "16px 32px", fontSize: 52, fontWeight: 800, letterSpacing: 8 }}>
            {partner?.promoCode ?? ""}
          </div>
          <div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>{partner?.address ?? "Maastricht"}</div>
        </div>
      </div>
    ),
    size
  );
}
