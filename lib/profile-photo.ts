// Build-time only: reads the profile photo saved from /admin so the share image, Google and the
// first paint of the page can use it. Photos live in Firestore as data URLs, which crawlers can't use.

export type Photo = { bytes: Buffer; type: string; dataUrl: string };

export async function fetchProfilePhoto(): Promise<Photo | null> {
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const key = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!project || !key) return null;
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/profile/main?key=${key}`,
    );
    if (!res.ok) return null;
    const doc = (await res.json()) as { fields?: { photoUrl?: { stringValue?: string } } };
    const dataUrl = doc.fields?.photoUrl?.stringValue ?? "";
    const match = dataUrl.match(/^data:(image\/[a-z+]+);base64,(.+)$/);
    if (!match) return null;
    return { bytes: Buffer.from(match[2], "base64"), type: match[1], dataUrl };
  } catch {
    return null; // offline build: fall back to the monogram
  }
}
