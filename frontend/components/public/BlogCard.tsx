import Link from "next/link";
import { Heart, MessageCircle, Eye } from "lucide-react";
import type { Blog } from "@/types/api";

export function BlogCard({ blog }: { blog: Blog }) {
  const created = new Date(blog.created_at);
  return (
    <Link
      href={`/blog/${blog.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-[0_0_25px_-5px_hsl(var(--primary)/0.3)]"
    >
      {blog.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blog.cover_image_url}
          alt=""
          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary">
          {blog.title}
        </h3>
        {blog.excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{blog.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {blog.author?.name} ·{" "}
            {created.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-3 w-3" /> {blog.likes_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" /> {blog.comments_count}
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3" /> {blog.views_count}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
