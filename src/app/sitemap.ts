import { MetadataRoute } from "next";
import { db } from "@/db";
import { beaches } from "@/db/schema";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://best-beachs.vercel.app";

  // Fetch all beaches to include in the sitemap
  const allBeaches = await db.select({
    slug: beaches.slug,
    updatedAt: beaches.updatedAt,
  }).from(beaches);

  const beachEntries = allBeaches.map((beach: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/beach/${beach.slug}`,
    lastModified: beach.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/favorites`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    ...beachEntries,
  ];
}
