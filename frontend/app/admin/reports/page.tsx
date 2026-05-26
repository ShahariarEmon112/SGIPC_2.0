"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCheck, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Report = {
  id: number;
  reason: string;
  status: "pending" | "resolved";
  created_at: string;
  reporter: { id: number; name: string };
  comment: {
    id: number;
    content: string;
    status: string;
    user: { id: number; name: string };
    blog: { id: number; title: string; slug: string };
  };
};

type Paginated = { data: Report[]; total: number };

const FILTERS = ["all", "pending", "resolved"] as const;

export default function AdminReportsPage() {
  const api = useApi();
  const [status, setStatus] = useState<(typeof FILTERS)[number]>("pending");
  const [data, setData] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = status === "all" ? "/admin/reports" : `/admin/reports?status=${status}`;
      const res = await api.get(url);
      setData(res.data.data);
    } catch {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const resolve = async (r: Report) => {
    setBusy(r.id);
    try {
      await api.patch(`/admin/reports/${r.id}/resolve`);
      toast.success("Marked resolved.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const deleteComment = async (r: Report) => {
    if (!confirm("Delete this comment and dismiss the report?")) return;
    setBusy(r.id);
    try {
      await api.delete(`/admin/comments/${r.comment.id}`);
      toast.success("Comment deleted, report dismissed.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const dismiss = async (r: Report) => {
    if (!confirm("Dismiss this report (keep the comment visible)?")) return;
    setBusy(r.id);
    try {
      await api.delete(`/admin/reports/${r.id}`);
      toast.success("Report dismissed.");
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Reports"
        description="User-submitted reports on comments. Resolve, delete the comment, or dismiss as no-action."
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
          {(data?.data ?? []).map((r) => (
            <article key={r.id} className="rounded-md border border-border bg-card p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  Reported by <span className="font-medium text-foreground">{r.reporter?.name}</span> · {new Date(r.created_at).toLocaleDateString()}
                  {r.comment?.blog && (
                    <>
                      {" "}on{" "}
                      <Link
                        href={`/blog/${r.comment.blog.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 hover:text-primary"
                      >
                        {r.comment.blog.title}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </>
                  )}
                </div>
                <span
                  className={cn(
                    "rounded-full border px-2 py-0.5 text-xs capitalize",
                    r.status === "pending"
                      ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
                      : "border-primary/40 bg-primary/10 text-primary"
                  )}
                >
                  {r.status}
                </span>
              </div>

              <div className="mb-3 rounded-md border-l-2 border-destructive/50 bg-destructive/5 p-3 text-sm">
                <div className="text-xs uppercase tracking-wider text-destructive">Reason</div>
                <div className="mt-1">{r.reason}</div>
              </div>

              <div className="mb-3 rounded-md border border-border bg-background/40 p-3">
                <div className="mb-1 text-xs text-muted-foreground">
                  Comment by <span className="text-foreground">{r.comment?.user?.name}</span>
                </div>
                <p className="text-sm">{r.comment?.content}</p>
              </div>

              {r.status === "pending" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => resolve(r)} disabled={busy === r.id}>
                    <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteComment(r)}
                    disabled={busy === r.id}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete comment
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => dismiss(r)} disabled={busy === r.id}>
                    Dismiss
                  </Button>
                </div>
              )}
            </article>
          ))}
          {(data?.data?.length ?? 0) === 0 && (
            <div className="rounded-md border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              No reports in this view.
            </div>
          )}
        </div>
      )}
    </>
  );
}
