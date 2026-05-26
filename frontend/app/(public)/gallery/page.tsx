import { GalleryFilterable } from "@/components/public/GalleryFilterable";
import { serverFetch } from "@/lib/server-api";
import type { GalleryItem } from "@/types/api";

export const metadata = { title: "Gallery · SGIPC" };

export default async function GalleryPage() {
  const items = (await serverFetch<GalleryItem[]>("/gallery")) ?? [];

  return (
    <main className="container py-16">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-wider text-primary">Team formations</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Gallery</h1>
        <p className="mt-2 text-muted-foreground">
          The SGIPC crew at contests over the years. Click any photo to view full size.
        </p>
      </div>
      <GalleryFilterable items={items} />
    </main>
  );
}
