"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { GalleryItem } from "@/types/api";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [active, setActive] = useState<GalleryItem | null>(null);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {items.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setActive(g)}
            className="group relative overflow-hidden rounded-lg border border-border bg-card"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={g.image_url}
              alt={g.title}
              loading="lazy"
              className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/0 to-black/0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="text-left text-xs font-medium text-white">{g.title}</div>
              {g.year && <div className="text-left text-[10px] text-white/70">{g.year}</div>}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal
        >
          <button
            onClick={() => setActive(null)}
            className="absolute right-4 top-4 rounded-full border border-border p-2 text-muted-foreground hover:bg-accent"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div
            className="max-h-[90vh] max-w-5xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.image_url}
              alt={active.title}
              className="max-h-[80vh] w-auto rounded-xl"
            />
            <div className="text-center">
              <div className="font-medium">{active.title}</div>
              {active.contest_name && (
                <div className="text-xs text-muted-foreground">
                  {active.contest_name}
                  {active.year ? ` · ${active.year}` : ""}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
