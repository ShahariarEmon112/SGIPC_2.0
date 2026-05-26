import { ResourceCard } from "@/components/public/ResourceCard";
import { serverFetch } from "@/lib/server-api";
import type { ResourceCategory, ResourcesResponse } from "@/types/api-extra";

export const metadata = {
  title: "Resources · SGIPC",
  description:
    "Curated competitive programming resources: algorithms, data structures, practice platforms, tutorials, and courses.",
};

const CATEGORY_META: Record<ResourceCategory, { title: string; description: string }> = {
  algorithms: {
    title: "Algorithms",
    description: "References and books on core algorithmic techniques.",
  },
  data_structures: {
    title: "Data structures",
    description: "From segment trees to persistent structures.",
  },
  practice: {
    title: "Practice platforms",
    description: "Where to actually solve problems and grind ratings.",
  },
  tutorial: {
    title: "Tutorials & videos",
    description: "Walkthroughs and live problem-solving content.",
  },
  course: {
    title: "Courses",
    description: "University courses and structured learning paths.",
  },
};

const ORDER: ResourceCategory[] = [
  "algorithms",
  "data_structures",
  "practice",
  "tutorial",
  "course",
];

export default async function ResourcesPage() {
  const data = await serverFetch<ResourcesResponse>("/resources");

  return (
    <main className="container py-16">
      <div className="mb-10">
        <div className="text-xs uppercase tracking-wider text-primary">Curated reading list</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Resources</h1>
        <p className="mt-2 text-muted-foreground">
          The handful of links you actually need to get good at competitive programming.
        </p>
      </div>

      {!data || data.total === 0 ? (
        <p className="text-muted-foreground">No resources yet.</p>
      ) : (
        <div className="space-y-16">
          {ORDER.filter((cat) => data.categories[cat]?.length > 0).map((cat) => (
            <section key={cat}>
              <header className="mb-5 flex items-baseline justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {CATEGORY_META[cat].title}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {CATEGORY_META[cat].description}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">
                  {data.categories[cat].length} item{data.categories[cat].length === 1 ? "" : "s"}
                </span>
              </header>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.categories[cat].map((r) => (
                  <ResourceCard key={r.id} r={r} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
