"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart, Flag, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/lib/useApi";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BlogComment } from "@/types/api";

type Props = {
  blogId: number;
  initialLiked: boolean;
  initialLikeCount: number;
  initialComments: BlogComment[];
};

export function BlogInteractions({
  blogId,
  initialLiked,
  initialLikeCount,
  initialComments,
}: Props) {
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const api = useApi();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const requireAuth = (): boolean => {
    if (!isLoggedIn) {
      toast.info("Log in to interact with posts.");
      router.push("/login?callbackUrl=" + encodeURIComponent(window.location.pathname));
      return false;
    }
    return true;
  };

  const toggleLike = async () => {
    if (!requireAuth()) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));
    try {
      if (wasLiked) {
        await api.delete(`/blogs/${blogId}/like`);
      } else {
        await api.post(`/blogs/${blogId}/like`);
      }
    } catch {
      setLiked(wasLiked);
      setLikeCount((c) => c + (wasLiked ? 1 : -1));
      toast.error("Something went wrong.");
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    const trimmed = draft.trim();
    if (trimmed.length < 2) {
      toast.error("Comment is too short.");
      return;
    }
    setPosting(true);
    try {
      const res = await api.post(`/blogs/${blogId}/comments`, { content: trimmed });
      const c: BlogComment = res.data.data;
      setComments((prev) => [c, ...prev]);
      setDraft("");
      toast.success("Comment posted.");
      startTransition(() => router.refresh());
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to post comment.");
    } finally {
      setPosting(false);
    }
  };

  const reportComment = async (commentId: number) => {
    if (!requireAuth()) return;
    const reason = prompt("Reason for reporting this comment?");
    if (!reason || reason.trim().length < 3) return;
    try {
      await api.post(`/comments/${commentId}/report`, { reason: reason.trim() });
      toast.success("Comment reported. Thanks for letting us know.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to report comment.");
    }
  };

  return (
    <>
      <div className="mb-12 flex items-center gap-3 border-t border-border pt-6">
        <Button
          variant={liked ? "default" : "outline"}
          size="sm"
          onClick={toggleLike}
          className={cn("group", liked && "")}
        >
          <Heart className={cn("mr-2 h-4 w-4", liked && "fill-current")} />
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      <section className="space-y-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <MessageCircle className="h-5 w-5" /> Comments
        </h2>

        {isLoggedIn ? (
          <form onSubmit={submitComment} className="space-y-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Share your thoughts…"
              rows={3}
              className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Posting as {session?.user?.name}
              </span>
              <Button type="submit" size="sm" disabled={posting}>
                {posting ? "Posting…" : "Post comment"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="rounded-md border border-border bg-card/50 p-4 text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>{" "}
            to leave a comment.
          </div>
        )}

        <div className="space-y-4">
          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground">No comments yet — be the first.</p>
          )}
          {comments.map((c) => (
            <article key={c.id} className="rounded-md border border-border bg-card/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">{c.user?.name ?? "Unknown"}</span>
                <div className="flex items-center gap-3">
                  <time className="text-xs text-muted-foreground">
                    {new Date(c.created_at).toLocaleDateString()}
                  </time>
                  {isLoggedIn && (
                    <button
                      type="button"
                      onClick={() => reportComment(c.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Report comment"
                    >
                      <Flag className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground/90">{c.content}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
