import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeader({
  eyebrow,
  title,
  more,
}: {
  eyebrow?: string;
  title: string;
  more?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="mb-1 text-xs uppercase tracking-wider text-primary">{eyebrow}</div>
        )}
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
      </div>
      {more && (
        <Link
          href={more.href}
          className="inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          {more.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
