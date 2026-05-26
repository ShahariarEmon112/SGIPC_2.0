"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Dialog } from "@/components/admin/Dialog";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Resource = {
  id: number;
  title: string;
  description: string | null;
  url: string;
  category: string;
  difficulty: string | null;
  order_index: number;
  is_published: boolean;
};

type FormState = {
  id?: number;
  title: string;
  description: string;
  url: string;
  category: "algorithms" | "data_structures" | "practice" | "tutorial" | "course";
  difficulty: "" | "beginner" | "intermediate" | "advanced";
  order_index: number;
  is_published: boolean;
};

const empty: FormState = {
  title: "",
  description: "",
  url: "",
  category: "algorithms",
  difficulty: "",
  order_index: 0,
  is_published: true,
};

export default function AdminResourcesPage() {
  const api = useApi();
  const [rows, setRows] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/resources");
      setRows(res.data.data);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.url.trim()) {
      toast.error("Title and URL are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        difficulty: editing.difficulty || null,
        description: editing.description || null,
      };
      if (editing.id) {
        await api.put(`/admin/resources/${editing.id}`, payload);
        toast.success("Updated.");
      } else {
        await api.post("/admin/resources", payload);
        toast.success("Added.");
      }
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (r: Resource) => {
    if (!confirm(`Remove "${r.title}"?`)) return;
    setBusy(r.id);
    try {
      await api.delete(`/admin/resources/${r.id}`);
      toast.success("Removed.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const togglePublish = async (r: Resource) => {
    setBusy(r.id);
    try {
      await api.patch(`/admin/resources/${r.id}/toggle-publish`);
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Resources"
        description="Curated learning links surfaced on the public /resources page."
        actions={
          <Button onClick={() => setEditing({ ...empty })}>
            <Plus className="mr-2 h-4 w-4" /> Add resource
          </Button>
        }
      />

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
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.title}</div>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      {new URL(r.url).host} <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-muted-foreground">
                    {r.category.replace("_", " ")}
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-muted-foreground">
                    {r.difficulty ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.order_index}</td>
                  <td className="px-4 py-3">
                    <PublishToggle
                      isPublished={r.is_published}
                      onChange={() => togglePublish(r)}
                      disabled={busy === r.id}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEditing({
                            id: r.id,
                            title: r.title,
                            description: r.description ?? "",
                            url: r.url,
                            category: r.category as FormState["category"],
                            difficulty: (r.difficulty ?? "") as FormState["difficulty"],
                            order_index: r.order_index,
                            is_published: r.is_published,
                          })
                        }
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => destroy(r)}
                        disabled={busy === r.id}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No resources yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Edit resource" : "Add resource"}
      >
        {editing && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>URL</Label>
              <Input
                type="url"
                value={editing.url}
                onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <textarea
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value as FormState["category"] })
                  }
                  className="h-10 w-full rounded-md border border-border bg-background/50 px-3 text-sm"
                >
                  <option value="algorithms">Algorithms</option>
                  <option value="data_structures">Data structures</option>
                  <option value="practice">Practice</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="course">Course</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Difficulty</Label>
                <select
                  value={editing.difficulty}
                  onChange={(e) =>
                    setEditing({ ...editing, difficulty: e.target.value as FormState["difficulty"] })
                  }
                  className="h-10 w-full rounded-md border border-border bg-background/50 px-3 text-sm"
                >
                  <option value="">—</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Order index</Label>
                <Input
                  type="number"
                  value={editing.order_index}
                  onChange={(e) =>
                    setEditing({ ...editing, order_index: parseInt(e.target.value || "0", 10) })
                  }
                />
              </div>
              <label className="flex items-end gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={editing.is_published}
                  onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                />
                Published
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
