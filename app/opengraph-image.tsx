import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site, siteUrl } from "@/lib/site";

export const dynamic = "force-static"; // required for the static export
export const alt = `${site.name}, ${site.jobTitle} in Lagos, Nigeria`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The card shown when the site is shared on LinkedIn, WhatsApp, X and so on.
// Same look as the site: dark background, faint grid, one indigo accent.
export default async function OpengraphImage() {
  // The site's display font, so the mark and headline match the page.
  const spaceGrotesk = await readFile(join(process.cwd(), "assets/space-grotesk-700.woff"));
  const grid = "rgba(255,255,255,0.05)";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0b0d12",
          backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          color: "#e8eaf0",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Space Grotesk", fontSize: 48, fontWeight: 700, letterSpacing: -2 }}>
          <span>G</span>
          <span style={{ color: "#8f91ff" }}>M</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 30, color: "#9aa3b4" }}>{`${site.name} / ${site.jobTitle} / Lagos, Nigeria`}</div>
          <div
            style={{ marginTop: 20, fontFamily: "Space Grotesk", fontSize: 80, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, maxWidth: 900 }}
          >
            I build software that businesses run on.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", fontSize: 26, color: "#9aa3b4" }}>
          <div style={{ width: 48, height: 3, background: "#8f91ff", marginRight: 18 }} />
          {siteUrl.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Space Grotesk", data: spaceGrotesk, weight: 700, style: "normal" }] },
  );
}
