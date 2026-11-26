import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { fetchProfilePhoto } from "@/lib/profile-photo";
import { site, siteUrl } from "@/lib/site";

export const dynamic = "force-static"; // required for the static export
export const alt = `${site.name}, ${site.jobTitle} in Lagos, Nigeria`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The card shown when the site is shared (LinkedIn, WhatsApp, X) and offered to Google:
// the hero photo in its accent ring beside the name, on the site's dark grid.
// The photo is captured at build time, so redeploy after changing it in /admin.
export default async function OpengraphImage() {
  const [spaceGrotesk, photo] = await Promise.all([
    readFile(join(process.cwd(), "assets/space-grotesk-700.woff")),
    fetchProfilePhoto(),
  ]);
  const grid = "rgba(255,255,255,0.05)";
  const display = { fontFamily: "Space Grotesk", fontWeight: 700 } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 80px",
          background: "#0b0d12",
          backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          color: "#e8eaf0",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 620 }}>
          <div style={{ display: "flex", ...display, fontSize: 40, letterSpacing: -2 }}>
            <span>G</span>
            <span style={{ color: "#8f91ff" }}>M</span>
          </div>
          <div style={{ display: "flex", marginTop: 56, ...display, fontSize: 84, lineHeight: 1, letterSpacing: -3 }}>
            {site.name}
          </div>
          <div style={{ display: "flex", marginTop: 22, fontSize: 34, color: "#c7ccd8" }}>{`${site.jobTitle}, Lagos, Nigeria`}</div>
          <div style={{ display: "flex", marginTop: 18, fontSize: 26, lineHeight: 1.35, color: "#9aa3b4" }}>
            Custom web platforms and operational tools for real businesses.
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 56, fontSize: 24, color: "#9aa3b4" }}>
            <div style={{ width: 44, height: 3, background: "#8f91ff", marginRight: 16 }} />
            {siteUrl.replace(/^https?:\/\//, "")}
          </div>
        </div>

        <div style={{ display: "flex", padding: 10, borderRadius: 9999, border: "4px solid #8f91ff" }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo.dataUrl}
              alt=""
              width={380}
              height={380}
              style={{ width: 380, height: 380, borderRadius: 9999, objectFit: "cover", objectPosition: "50% 20%" }}
            />
          ) : (
            <div
              style={{
                width: 380,
                height: 380,
                borderRadius: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#171c28",
                ...display,
                fontSize: 150,
              }}
            >
              <span>G</span>
              <span style={{ color: "#8f91ff" }}>M</span>
            </div>
          )}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Space Grotesk", data: spaceGrotesk, weight: 700, style: "normal" }] },
  );
}
