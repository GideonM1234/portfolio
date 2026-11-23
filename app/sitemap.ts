import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-static"; // required for the static export

// One page: the admin is private and kept out of search.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
