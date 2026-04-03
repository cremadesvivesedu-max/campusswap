import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CampusSwap",
    short_name: "CampusSwap",
    description: "Student-only marketplace for Maastricht essentials.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f4ee",
    theme_color: "#70f0cb",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ]
  };
}
