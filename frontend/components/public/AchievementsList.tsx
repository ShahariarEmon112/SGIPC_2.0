"use client";

import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { YearChips } from "./YearChips";
import type { Achievement } from "@/types/api";

export function AchievementsList({ achievements }: { achievements: Achievement[] }) {
  const years = useMemo(
    () => Array.from(new Set(achievements.map((a) => a.year))).sort((a, b) => b - a),
    [achievements]
  );
  const [year, setYear] = useState<number | "all">("all");
  const filtered = year === "all" ? achievements : achievements.filter((a) => a.year === year);

  return (
    <>
      <YearChips years={years} value={year} onChange={setYear} />
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No achievements for that year.</p>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <article
              key={a.id}
              className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                <Trophy className="h-3 w-3" /> {a.position} · {a.year}
              </div>
              <h3 className="mt-3 font-semibold leading-snug">{a.contest_name}</h3>
              {a.members?.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">{a.members.join(" · ")}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
