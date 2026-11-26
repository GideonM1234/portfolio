import { ImageResponse } from "next/og";
import { fetchProfilePhoto } from "@/lib/profile-photo";

export const dynamic = "force-static"; // required for the static export

// The hero photo as a real image file (/profile-photo.jpg) for Google, structured data and the
// page's first paint. It is captured at build time, so redeploy after changing the photo.
export async function GET() {
  const photo = await fetchProfilePhoto();
  if (photo) return new Response(new Uint8Array(photo.bytes), { headers: { "Content-Type": photo.type } });

  // No photo saved yet: a plain GM monogram so the file always exists.
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0d12", fontSize: 260, fontWeight: 700 }}>
        <span style={{ color: "#e8eaf0" }}>G</span>
        <span style={{ color: "#8f91ff" }}>M</span>
      </div>
    ),
    { width: 800, height: 1000 },
  );
}
