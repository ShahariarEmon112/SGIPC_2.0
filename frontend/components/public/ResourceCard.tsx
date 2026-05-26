import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Resource } from "@/types/api-extra";

function difficultyTone(d: Resource["difficulty"]) {
  switch (d) {
    case "beginner":
      return "border-green-500/40 bg-green-500/10 text-green-400";
    case "intermediate":
      return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
    case "advanced":
      return "border-red-500/40 bg-red-500/10 text-red-400";
    default:
      return "border-border text-muted-foreground";
  }
}

export function ResourceCard({ r }: { r: Resource }) {
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
          {r.title}
        </h3>
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
      </div>
      {r.description && (
        <p className="line-clamp-3 text-sm text-muted-foreground">{r.description}</p>
      )}
      {r.difficulty && (
        <span
          className={cn(
            "mt-auto inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider",
            difficultyTone(r.difficulty)
          )}
        >
          {r.difficulty}
        </span>
      )}
    </a>
  );
}
