import { LeaderboardClient } from "@/components/public/LeaderboardClient";
import { serverFetch } from "@/lib/server-api";
import type { LeaderboardResponse } from "@/types/api-extra";

export const metadata = {
  title: "Leaderboard · SGIPC",
  description: "Top SGIPC members ranked by Codeforces rating, wins, and contests participated.",
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { year?: string };
}) {
  const path = searchParams.year ? `/leaderboard?year=${searchParams.year}` : "/leaderboard";
  const data = await serverFetch<LeaderboardResponse>(path, { cache: "no-store" });

  return (
    <main className="container py-16">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-wider text-primary">Top of the ladder</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-muted-foreground">
          SGIPC members ranked by Codeforces rating, contests played, and wins.
        </p>
      </div>

      {data ? (
        <LeaderboardClient year={data.year} years={data.years} entries={data.entries} />
      ) : (
        <p className="text-muted-foreground">No leaderboard data yet.</p>
      )}
    </main>
  );
}
