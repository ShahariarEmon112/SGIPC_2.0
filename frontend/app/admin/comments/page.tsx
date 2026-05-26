"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, EyeOff, RotateCcw, Loader2, ExternalLink } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Comment = {
  id: number;
  content: string;
  status: "visible" | "hidden" | "reported";
  reported_at: string | null;
  reports_count: number;
  created_at: string;
  user: { id: number; name: string };
  blog: { id: number; title: string; slug: string };
};

type Paginated = { data: Comment[]; total: number };

const FILTERS = ["all", "visible", "reported", "hidden"] as const;

export default function AdminCommentsPage() {
  const api = useApi();
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("all");
  const [data, setData] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = status === "all" ? "/admin/comments" : `/admin/comments?status=${status}`;
      const res = await api.get(url);
      setData(res.data.data);
    } catch {
      toast.error("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const hide = async (c: Comment) => {
    setBusy(c.id);
    try {
      await api.patch(`/admin/comments/${c.id}/hide`);
      toast.success("Hidden.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const restore = async (c: Comment) => {
    setBusy(c.id);
    try {
      await api.patch(`/admin/comments/${c.id}/restore`);
      toast.success("Restored.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const destroy = async (c: Comment) => {
    if (!confirm("Permanently delete this comment?")) return;
    setBusy(c.id);
    try {
      await api.delete(`/admin/comments/${c.id}`);
      toast.success("Deleted.");
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Comments"
        description="Moderate comments across all blog posts. Hide to remove from public view; delete is permanent."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatus(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
              status === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {f} {data && status === f ? `(${data.total})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {(data?.data ?? []).map((c) => (
            <article
              key={c.id}
              className={cn(
                "rounded-md border bg-card p-4",
                c.status === "reported" && "border-destructive/40"
              )}
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{c.user?.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    on <Link href={`/blog/${c.blog?.slug}`} target="_blank" className="hover:text-primary inline-flex items-center gap-1">
                      {c.blog?.title} <ExternalLink className="h-3 w-3" />
                    </Link>
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    · {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <StatusBadge status={c.status} reportsCount={c.reports_count} />
              </div>
              <p className="text-sm text-foreground/90">{c.content}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.status !== "hidden" ? (
                  <Button size="sm" variant="outline" onClick={() => hide(c)} disabled={busy === c.id}>
                    <EyeOff className="mr-1 h-3.5 w-3.5" /> Hide
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => restore(c)} disabled={busy === c.id}>
                    <RotateCcw className="mr-1 h-3.5 w-3.5" /> Restore
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => destroy(c)}
                  disabled={busy === c.id}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </article>
          ))}
          {(data?.data?.length ?? 0) === 0 && (
            <div className="rounded-md border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No comments in this view.
            </div>
          )}
        </div>
      )}
    </>
  );
}

function StatusBadge({
  status,
  reportsCount,
}: {
  status: Comment["status"];
  reportsCount: number;
}) {
  const styles = {
    visible: "border-primary/40 bg-primary/10 text-primary",
    reported: "border-destructive/40 bg-destructive/10 text-destructive",
    hidden: "border-muted-foreground/40 text-muted-foreground",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize", styles[status])}>
      {status}
      {status === "reported" && reportsCount > 1 && ` · ${reportsCount} reports`}
    </span>
  );
}
