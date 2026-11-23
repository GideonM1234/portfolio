import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static"; // required for the static export

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.title,
    short_name: site.initials,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: "#0b0d12",
    theme_color: "#0b0d12",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
