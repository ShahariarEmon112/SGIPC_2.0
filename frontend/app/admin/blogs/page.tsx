"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Plus, CheckCircle2, XCircle, Trash2, Loader2, ExternalLink } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Dialog } from "@/components/admin/Dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Blog = {
  id: number;
  title: string;
  slug: string;
  status: "pending" | "approved" | "rejected";
  is_published: boolean;
  rejection_reason: string | null;
  author: { id: number; name: string };
  comments_count: number;
  likes_count: number;
  created_at: string;
};

type Paginated = { data: Blog[]; total: number };

const FILTERS = ["all", "pending", "approved", "rejected"] as const;

export default function AdminBlogsPage() {
  const params = useSearchParams();
  const initial =
    (FILTERS.includes(params.get("status") as any) ? params.get("status") : "all") as
      | "all"
      | "pending"
      | "approved"
      | "rejected";

  const api = useApi();
  const [status, setStatus] = useState<typeof initial>(initial);
  const [data, setData] = useState<Paginated | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "", excerpt: "", cover_image_url: null as string | null });
  const [saving, setSaving] = useState(false);
  const [rejecting, setRejecting] = useState<Blog | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = status === "all" ? "/admin/blogs" : `/admin/blogs?status=${status}`;
      const res = await api.get(url);
      setData(res.data.data);
    } catch {
      toast.error("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const approve = async (b: Blog) => {
    setBusy(b.id);
    try {
      await api.patch(`/admin/blogs/${b.id}/approve`);
      toast.success("Approved.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const submitReject = async () => {
    if (!rejecting || reason.trim().length < 3) {
      toast.error("Reason required.");
      return;
    }
    setBusy(rejecting.id);
    try {
      await api.patch(`/admin/blogs/${rejecting.id}/reject`, { reason });
      toast.success("Rejected.");
      setRejecting(null);
      setReason("");
      load();
    } finally {
      setBusy(null);
    }
  };

  const destroy = async (b: Blog) => {
    if (!confirm(`Delete "${b.title}"?`)) return;
    setBusy(b.id);
    try {
      await api.delete(`/admin/blogs/${b.id}`);
      toast.success("Deleted.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const create = async () => {
    if (!draft.title.trim() || draft.content.length < 30) {
      toast.error("Title and content (≥30 chars) required.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/admin/blogs", draft);
      toast.success("Blog post published.");
      setCreating(false);
      setDraft({ title: "", content: "", excerpt: "", cover_image_url: null });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Blogs"
        description="Approve / reject member submissions, or write a post directly as admin."
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> New post
          </Button>
        }
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
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Engagement</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((b) => (
                <tr key={b.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{b.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(b.created_at).toLocaleDateString()}
                      {b.rejection_reason && ` · ${b.rejection_reason}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.author?.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    ♥ {b.likes_count} · 💬 {b.comments_count}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {b.status === "approved" && (
                        <Link
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      {b.status !== "approved" && (
                        <Button size="sm" variant="outline" onClick={() => approve(b)} disabled={busy === b.id}>
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                      {b.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejecting(b)}
                          disabled={busy === b.id}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => destroy(b)}
                        disabled={busy === b.id}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(data?.data?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No blog posts in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={creating}
        onClose={() => setCreating(false)}
        title="New blog post"
        size="xl"
      >
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="e.g. Mastering Segment Trees with Lazy Propagation"
            />
          </div>
          <ImageUpload
            folder="sgipc/blogs"
            label="Cover image"
            value={draft.cover_image_url}
            onChange={(url) => setDraft({ ...draft, cover_image_url: url })}
          />
          <div className="space-y-1.5">
            <Label>Excerpt (optional — auto-generated if blank)</Label>
            <Input
              value={draft.excerpt}
              onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              maxLength={500}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Content</Label>
            <RichTextEditor
              value={draft.content}
              onChange={(html) => setDraft({ ...draft, content: html })}
              minHeight="16rem"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button onClick={create} disabled={saving}>
              {saving ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </div>
      </Dialog>

      <Dialog
        open={!!rejecting}
        onClose={() => {
          setRejecting(null);
          setReason("");
        }}
        title="Reject blog post"
      >
        <p className="mb-3 text-sm text-muted-foreground">"{rejecting?.title}" will be marked rejected with this reason.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection…"
          rows={4}
          className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => { setRejecting(null); setReason(""); }}>
            Cancel
          </Button>
          <Button onClick={submitReject} disabled={busy !== null}>
            Reject
          </Button>
        </div>
      </Dialog>
    </>
  );
}

function StatusBadge({ status }: { status: Blog["status"] }) {
  const styles = {
    approved: "border-primary/40 bg-primary/10 text-primary",
    pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
    rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize", styles[status])}>
      {status}
    </span>
  );
}
