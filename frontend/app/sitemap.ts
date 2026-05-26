import type { MetadataRoute } from "next";
import { serverFetch } from "@/lib/server-api";
import type { BlogPage } from "@/types/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticPaths = [
    "",
    "/about",
    "/events",
    "/contest",
    "/achievements",
    "/leaderboard",
    "/gallery",
    "/blog",
    "/resources",
    "/login",
    "/register",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: p === "" || p === "/blog" ? "daily" : "weekly",
    priority: p === "" ? 1.0 : 0.7,
  }));

  // Pull every approved blog slug for the sitemap. Pagination keeps each call small.
  try {
    const slugs: string[] = [];
    let page = 1;
    while (page <= 50) {
      const data = await serverFetch<BlogPage>(`/blogs?page=${page}`, { revalidate: 3600 });
      if (!data || data.data.length === 0) break;
      data.data.forEach((b) => slugs.push(b.slug));
      if (page >= data.last_page) break;
      page++;
    }
    slugs.forEach((slug) => {
      entries.push({
        url: `${base}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    });
  } catch {
    // If the API is offline, fall back to just the static paths.
  }

  return entries;
}
