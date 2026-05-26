import Link from "next/link";
import { Search } from "lucide-react";
import { BlogCard } from "@/components/public/BlogCard";
import { serverFetch } from "@/lib/server-api";
import type { BlogPage } from "@/types/api";

export const metadata = { title: "Blog · SGIPC" };

export default async function BlogListing({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const q = (searchParams.q ?? "").trim();
  const params = new URLSearchParams({ page: String(page) });
  if (q) params.set("q", q);

  const data = await serverFetch<BlogPage>(`/blogs?${params.toString()}`);
  const blogs = data?.data ?? [];
  const lastPage = data?.last_page ?? 1;
  const total = data?.total ?? 0;

  return (
    <main className="container py-16">
      <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-primary">From the club</div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Blog</h1>
          <p className="mt-2 text-muted-foreground">
            {total > 0 ? `${total} posts on competitive programming, algorithms, and ICPC.` : "Coming soon."}
          </p>
        </div>
        <form action="/blog" method="get" className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search posts…"
            className="h-10 w-full rounded-md border border-border bg-background/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </form>
      </div>

      {blogs.length === 0 ? (
        <p className="text-muted-foreground">No posts found{q ? ` for "${q}"` : ""}.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-2 text-sm">
          {page > 1 && (
            <Link
              href={makeHref(page - 1, q)}
              className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              ← Prev
            </Link>
          )}
          <span className="text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          {page < lastPage && (
            <Link
              href={makeHref(page + 1, q)}
              className="rounded-md border border-border px-3 py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            >
              Next →
            </Link>
          )}
        </nav>
      )}
    </main>
  );
}

function makeHref(page: number, q?: string) {
  const p = new URLSearchParams();
  p.set("page", String(page));
  if (q) p.set("q", q);
  return `/blog?${p.toString()}`;
}
