"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Dialog } from "@/components/admin/Dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Contest = {
  id: number;
  title: string;
  description: string;
  contest_date: string;
  platform: string | null;
  registration_link: string | null;
  image_url: string | null;
  is_published: boolean;
};

type FormState = {
  id?: number;
  title: string;
  description: string;
  contest_date: string;
  platform: string;
  registration_link: string;
  image_url: string | null;
  is_published: boolean;
};

const empty: FormState = {
  title: "",
  description: "",
  contest_date: "",
  platform: "Codeforces",
  registration_link: "",
  image_url: null,
  is_published: true,
};

export default function AdminContestsPage() {
  const api = useApi();
  const [rows, setRows] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/contests");
      setRows(res.data.data);
    } catch {
      toast.error("Failed to load contests.");
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
    if (!editing.title.trim() || !editing.description.trim() || !editing.contest_date) {
      toast.error("Title, description, and date are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: editing.title,
        description: editing.description,
        contest_date: editing.contest_date,
        platform: editing.platform || null,
        registration_link: editing.registration_link || null,
        image_url: editing.image_url,
        is_published: editing.is_published,
      };
      if (editing.id) {
        await api.put(`/admin/contests/${editing.id}`, payload);
        toast.success("Contest updated.");
      } else {
        await api.post("/admin/contests", payload);
        toast.success("Contest created.");
      }
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (c: Contest) => {
    if (!confirm(`Delete "${c.title}"?`)) return;
    setBusy(c.id);
    try {
      await api.delete(`/admin/contests/${c.id}`);
      toast.success("Deleted.");
      load();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setBusy(null);
    }
  };

  const togglePublish = async (c: Contest) => {
    setBusy(c.id);
    try {
      await api.patch(`/admin/contests/${c.id}/toggle-publish`);
      load();
    } catch {
      toast.error("Failed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Contests"
        description="Upcoming and past contest announcements."
        actions={
          <Button onClick={() => setEditing({ ...empty })}>
            <Plus className="mr-2 h-4 w-4" /> New contest
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
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.contest_date).toLocaleString(undefined, {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.platform ?? "—"}
                  </td>
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
                            description: r.description,
                            contest_date: r.contest_date.slice(0, 16),
                            platform: r.platform ?? "",
                            registration_link: r.registration_link ?? "",
                            image_url: r.image_url,
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
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No contests yet.
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
        title={editing?.id ? "Edit contest" : "New contest"}
        size="lg"
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
                <Label>Date & time</Label>
                <Input
                  type="datetime-local"
                  value={editing.contest_date}
                  onChange={(e) => setEditing({ ...editing, contest_date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Platform</Label>
                <Input
                  value={editing.platform}
                  onChange={(e) => setEditing({ ...editing, platform: e.target.value })}
                  placeholder="Codeforces"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Registration link</Label>
              <Input
                type="url"
                value={editing.registration_link}
                onChange={(e) => setEditing({ ...editing, registration_link: e.target.value })}
                placeholder="https://codeforces.com/group/sgipc/contest/…"
              />
            </div>
            <ImageUpload
              folder="sgipc/contests"
              label="Cover image"
              value={editing.image_url}
              onChange={(url) => setEditing({ ...editing, image_url: url })}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.is_published}
                onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
              />
              Publish on public site
            </label>
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
