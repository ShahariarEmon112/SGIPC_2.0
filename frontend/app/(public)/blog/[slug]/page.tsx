import { notFound } from "next/navigation";
import { Eye, Calendar } from "lucide-react";
import { BlogInteractions } from "@/components/public/BlogInteractions";
import { serverFetch } from "@/lib/server-api";
import type { BlogDetail } from "@/types/api";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const detail = await serverFetch<BlogDetail>(`/blogs/${params.slug}`);
  if (!detail) return { title: "Blog · SGIPC" };
  return {
    title: `${detail.blog.title} · SGIPC`,
    description: detail.blog.excerpt ?? undefined,
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const detail = await serverFetch<BlogDetail>(`/blogs/${params.slug}`, { cache: "no-store" });
  if (!detail) return notFound();

  const { blog, liked_by_me } = detail;

  return (
    <main className="container py-16">
      <article className="mx-auto max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-primary">SGIPC Blog</div>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          {blog.title}
        </h1>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span>{blog.author?.name}</span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(blog.created_at).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {blog.views_count} views
          </span>
        </div>

        {blog.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={blog.cover_image_url}
            alt=""
            className="mt-8 w-full rounded-xl border border-border"
          />
        )}

        <div
          className="mt-10 space-y-5 text-base leading-relaxed text-foreground/90 [&_p]:leading-relaxed [&_code]:rounded [&_code]:bg-accent [&_code]:px-1 [&_code]:py-0.5 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <div className="mt-16">
          <BlogInteractions
            blogId={blog.id}
            initialLiked={liked_by_me}
            initialLikeCount={blog.likes_count}
            initialComments={blog.comments ?? []}
          />
        </div>
      </article>
    </main>
  );
}
