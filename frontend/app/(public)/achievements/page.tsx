import { Trophy, Crown } from "lucide-react";
import { AchievementsList } from "@/components/public/AchievementsList";
import { serverFetch } from "@/lib/server-api";
import type { Achievement } from "@/types/api";

export const metadata = { title: "Achievements · SGIPC" };

export default async function AchievementsPage() {
  const data = (await serverFetch<Achievement[]>("/achievements")) ?? [];
  const hallOfFame = data.filter((a) => a.position === "1st").slice(0, 3);

  return (
    <main className="container py-16">
      <div className="mb-12">
        <div className="text-xs uppercase tracking-wider text-primary">Wins from the road</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Achievements</h1>
      </div>

      {hallOfFame.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-6 inline-flex items-center gap-2 text-xl font-semibold">
            <Crown className="h-5 w-5 text-primary" /> Hall of Fame
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {hallOfFame.map((a) => (
              <article
                key={a.id}
                className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card p-6"
              >
                <div className="absolute right-4 top-4 opacity-20">
                  <Trophy className="h-12 w-12 text-primary" />
                </div>
                <div className="text-xs uppercase tracking-wider text-primary">
                  Champions · {a.year}
                </div>
                <h3 className="mt-2 font-semibold leading-snug">{a.contest_name}</h3>
                {a.members?.length > 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">{a.members.join(" · ")}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      <AchievementsList achievements={data} />
    </main>
  );
}
