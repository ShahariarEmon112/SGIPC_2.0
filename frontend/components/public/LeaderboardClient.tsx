"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Crown, Trophy, Medal, ExternalLink, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types/api-extra";

function ratingTone(r: number) {
  if (r >= 2400) return "text-red-400";
  if (r >= 2100) return "text-orange-400";
  if (r >= 1900) return "text-violet-400";
  if (r >= 1600) return "text-blue-400";
  if (r >= 1400) return "text-cyan-400";
  if (r >= 1200) return "text-green-400";
  return "text-muted-foreground";
}

export function LeaderboardClient({
  year,
  years,
  entries,
}: {
  year: number;
  years: number[];
  entries: LeaderboardEntry[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedYear, setSelectedYear] = useState(year);

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  const changeYear = (y: number) => {
    setSelectedYear(y);
    startTransition(() => router.push(`/leaderboard?year=${y}`));
  };

  return (
    <>
      {years.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => changeYear(y)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs transition-colors",
                y === selectedYear
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {entries.length === 0 ? (
        <p className="text-muted-foreground">No entries published for {selectedYear}.</p>
      ) : (
        <>
          {podium.length > 0 && (
            <section className="mb-12 grid gap-4 md:grid-cols-3">
              {podium.map((e, i) => (
                <PodiumCard key={e.id} entry={e} place={i + 1} />
              ))}
            </section>
          )}

          {rest.length > 0 && (
            <section className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="min-w-full text-sm">
                <thead className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Max</th>
                    <th className="px-4 py-3">Wins</th>
                    <th className="px-4 py-3">Contests</th>
                    <th className="px-4 py-3 text-right">CF</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((e, i) => (
                    <tr key={e.id} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 text-muted-foreground">{e.rank_position ?? i + 4}</td>
                      <td className="px-4 py-3 font-medium">{e.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.batch ?? "—"}</td>
                      <td className={cn("px-4 py-3 font-semibold", ratingTone(e.rating))}>{e.rating}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.max_rating || "—"}</td>
                      <td className="px-4 py-3">{e.wins}</td>
                      <td className="px-4 py-3 text-muted-foreground">{e.contests_participated}</td>
                      <td className="px-4 py-3 text-right">
                        {e.cf_handle && (
                          <a
                            href={`https://codeforces.com/profile/${e.cf_handle}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                          >
                            {e.cf_handle}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </>
  );
}

function PodiumCard({ entry, place }: { entry: LeaderboardEntry; place: number }) {
  const icon = place === 1 ? Crown : place === 2 ? Trophy : Medal;
  const accents = {
    1: "border-yellow-400/60 bg-yellow-400/5 [--accent:theme(colors.yellow.400)]",
    2: "border-zinc-400/60 bg-zinc-400/5 [--accent:theme(colors.zinc.300)]",
    3: "border-amber-700/60 bg-amber-700/5 [--accent:theme(colors.amber.500)]",
  } as const;
  const Icon = icon;
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border-2 p-6", accents[place as 1 | 2 | 3])}>
      <Icon className="absolute right-4 top-4 h-8 w-8 opacity-30" style={{ color: "var(--accent)" }} />
      <div className="text-xs uppercase tracking-wider" style={{ color: "var(--accent)" }}>
        Rank #{entry.rank_position ?? place}
      </div>
      <h3 className="mt-2 text-xl font-semibold">{entry.name}</h3>
      {entry.cf_handle && (
        <a
          href={`https://codeforces.com/profile/${entry.cf_handle}`}
          target="_blank"
          rel="noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          {entry.cf_handle} <ExternalLink className="h-3 w-3" />
        </a>
      )}
      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-3xl font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
            {entry.rating}
          </div>
          <div className="text-xs text-muted-foreground">
            <TrendingUp className="-mt-0.5 inline h-3 w-3" /> max {entry.max_rating || "—"}
          </div>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>{entry.wins} wins</div>
          <div>{entry.contests_participated} contests</div>
        </div>
      </div>
      {entry.batch && (
        <div className="mt-3 text-xs text-muted-foreground">Batch {entry.batch}</div>
      )}
    </div>
  );
}
