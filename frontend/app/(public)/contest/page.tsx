import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/public/CountdownTimer";
import { serverFetch } from "@/lib/server-api";
import type { Contest, ContestsResponse } from "@/types/api";

export const metadata = { title: "Contests · SGIPC" };

export default async function ContestPage() {
  const data = (await serverFetch<ContestsResponse>("/contests")) ?? {
    upcoming: [],
    past: [],
  };

  return (
    <main className="container py-16">
      <div className="mb-12">
        <div className="text-xs uppercase tracking-wider text-primary">Contest announcements</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Contests</h1>
      </div>

      {data.upcoming.length > 0 ? (
        <section className="mb-16">
          <h2 className="mb-6 text-xl font-semibold">Upcoming</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {data.upcoming.map((c) => (
              <UpcomingCard key={c.id} c={c} />
            ))}
          </div>
        </section>
      ) : (
        <p className="mb-16 text-muted-foreground">No contests scheduled yet — check back soon.</p>
      )}

      <section>
        <h2 className="mb-6 text-xl font-semibold">Past</h2>
        <div className="space-y-3">
          {data.past.map((c) => (
            <PastRow key={c.id} c={c} />
          ))}
        </div>
      </section>
    </main>
  );
}

function UpcomingCard({ c }: { c: Contest }) {
  return (
    <article className="rounded-2xl border border-primary/30 bg-card p-6">
      <div className="text-xs uppercase tracking-wider text-primary">
        {c.platform ?? "Online"} ·{" "}
        {new Date(c.contest_date).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </div>
      <h3 className="mt-2 text-xl font-semibold">{c.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
      <div className="mt-4">
        <CountdownTimer target={c.contest_date} />
      </div>
      {c.registration_link && (
        <Button asChild className="mt-5">
          <a href={c.registration_link} target="_blank" rel="noreferrer">
            Register <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      )}
    </article>
  );
}

function PastRow({ c }: { c: Contest }) {
  return (
    <article className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h3 className="font-medium">{c.title}</h3>
        <p className="text-xs text-muted-foreground">
          {c.platform ?? "Online"} ·{" "}
          {new Date(c.contest_date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
      {c.registration_link && (
        <a
          href={c.registration_link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          Standings <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </article>
  );
}
