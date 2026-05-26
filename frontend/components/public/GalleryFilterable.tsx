"use client";

import { useMemo, useState } from "react";
import { YearChips } from "./YearChips";
import { GalleryGrid } from "./GalleryGrid";
import type { GalleryItem } from "@/types/api";

export function GalleryFilterable({ items }: { items: GalleryItem[] }) {
  const yearsAll = useMemo(
    () =>
      Array.from(new Set(items.map((g) => g.year).filter((y): y is number => y != null))).sort(
        (a, b) => b - a
      ),
    [items]
  );
  const [year, setYear] = useState<number | "all">("all");
  const filtered = year === "all" ? items : items.filter((g) => g.year === year);

  return (
    <>
      <YearChips years={yearsAll} value={year} onChange={setYear} />
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No photos for that year.</p>
      ) : (
        <GalleryGrid items={filtered} />
      )}
    </>
  );
}
