"use client";

import { useMemo, useState } from "react";
import { MapPin, Calendar } from "lucide-react";
import { YearChips } from "./YearChips";
import type { Event } from "@/types/api";

export function EventsList({ events }: { events: Event[] }) {
  const years = useMemo(() => {
    const ys = Array.from(new Set(events.map((e) => new Date(e.event_date).getFullYear())));
    return ys.sort((a, b) => b - a);
  }, [events]);
  const [year, setYear] = useState<number | "all">("all");

  const filtered =
    year === "all" ? events : events.filter((e) => new Date(e.event_date).getFullYear() === year);

  return (
    <>
      <YearChips years={years} value={year} onChange={setYear} />
      {filtered.length === 0 ? (
        <p className="text-muted-foreground">No events for that year.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <article
              key={e.id}
              className="overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
            >
              {e.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={e.image_url} alt="" className="h-44 w-full object-cover" />
              )}
              <div className="p-5">
                <h3 className="font-semibold leading-snug">{e.title}</h3>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(e.event_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {e.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {e.location}
                    </span>
                  )}
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{e.description}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
