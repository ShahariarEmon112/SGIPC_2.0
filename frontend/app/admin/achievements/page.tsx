"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Dialog } from "@/components/admin/Dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Achievement = {
  id: number;
  title: string;
  description: string | null;
  contest_name: string;
  position: string;
  year: number;
  image_url: string | null;
  members: string[];
  is_published: boolean;
};

type FormState = {
  id?: number;
  title: string;
  description: string;
  contest_name: string;
  position: string;
  year: number;
  members: string[];
  image_url: string | null;
  is_published: boolean;
};

const empty: FormState = {
  title: "",
  description: "",
  contest_name: "",
  position: "1st",
  year: new Date().getFullYear(),
  members: [],
  image_url: null,
  is_published: true,
};

export default function AdminAchievementsPage() {
  const api = useApi();
  const [rows, setRows] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [memberDraft, setMemberDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/achievements");
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
    if (!editing.title.trim() || !editing.contest_name.trim() || !editing.position) {
      toast.error("Title, contest name, and position are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: editing.title,
        description: editing.description || null,
        contest_name: editing.contest_name,
        position: editing.position,
        year: editing.year,
        members: editing.members,
        image_url: editing.image_url,
        is_published: editing.is_published,
      };
      if (editing.id) {
        await api.put(`/admin/achievements/${editing.id}`, payload);
        toast.success("Updated.");
      } else {
        await api.post("/admin/achievements", payload);
        toast.success("Created.");
      }
      setEditing(null);
      setMemberDraft("");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (a: Achievement) => {
    if (!confirm(`Delete "${a.title}"?`)) return;
    setBusy(a.id);
    try {
      await api.delete(`/admin/achievements/${a.id}`);
      toast.success("Deleted.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const togglePublish = async (a: Achievement) => {
    setBusy(a.id);
    try {
      await api.patch(`/admin/achievements/${a.id}/toggle-publish`);
      load();
    } finally {
      setBusy(null);
    }
  };

  const addMember = () => {
    const t = memberDraft.trim();
    if (!t || !editing) return;
    setEditing({ ...editing, members: [...editing.members, t] });
    setMemberDraft("");
  };

  return (
    <>
      <AdminPageHeader
        title="Achievements"
        description="ICPC and inter-university wins. Members are listed in order on the cards."
        actions={
          <Button onClick={() => setEditing({ ...empty })}>
            <Plus className="mr-2 h-4 w-4" /> New achievement
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
                <th className="px-4 py-3">Contest</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.contest_name}</div>
                    <div className="text-xs text-muted-foreground">{r.title}</div>
                  </td>
                  <td className="px-4 py-3 text-primary">{r.position}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.year}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.members?.join(", ") || "—"}
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
                            description: r.description ?? "",
                            contest_name: r.contest_name,
                            position: r.position,
                            year: r.year,
                            members: r.members ?? [],
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
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No achievements yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={!!editing}
        onClose={() => {
          setEditing(null);
          setMemberDraft("");
        }}
        title={editing?.id ? "Edit achievement" : "New achievement"}
        size="lg"
      >
        {editing && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="e.g. 1st — ICPC Asia Dhaka Regional"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Contest name</Label>
              <Input
                value={editing.contest_name}
                onChange={(e) => setEditing({ ...editing, contest_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Position</Label>
                <select
                  value={editing.position}
                  onChange={(e) => setEditing({ ...editing, position: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background/50 px-3 text-sm"
                >
                  <option>1st</option>
                  <option>2nd</option>
                  <option>3rd</option>
                  <option>Honorable Mention</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={editing.year}
                  onChange={(e) =>
                    setEditing({ ...editing, year: parseInt(e.target.value || "0", 10) })
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description (optional)</Label>
              <textarea
                rows={2}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Team members</Label>
              <div className="flex gap-2">
                <Input
                  value={memberDraft}
                  onChange={(e) => setMemberDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMember();
                    }
                  }}
                  placeholder="Add a member name and press Enter"
                />
                <Button type="button" variant="outline" onClick={addMember}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {editing.members.map((m, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-accent px-2 py-0.5 text-xs"
                  >
                    {m}
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          members: editing.members.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <ImageUpload
              folder="sgipc/achievements"
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
