"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Dialog } from "@/components/admin/Dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Entry = {
  id: number;
  name: string;
  batch: string | null;
  cf_handle: string | null;
  rating: number;
  max_rating: number;
  wins: number;
  contests_participated: number;
  year: number;
  rank_position: number | null;
  profile_photo_url: string | null;
  is_published: boolean;
};

type FormState = {
  id?: number;
  name: string;
  batch: string;
  cf_handle: string;
  rating: number;
  max_rating: number;
  wins: number;
  contests_participated: number;
  year: number;
  rank_position: number;
  is_published: boolean;
};

const empty: FormState = {
  name: "",
  batch: "",
  cf_handle: "",
  rating: 1200,
  max_rating: 1200,
  wins: 0,
  contests_participated: 0,
  year: new Date().getFullYear(),
  rank_position: 1,
  is_published: true,
};

export default function AdminLeaderboardPage() {
  const api = useApi();
  const [rows, setRows] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/leaderboard");
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
    if (!editing.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...editing,
        batch: editing.batch || null,
        cf_handle: editing.cf_handle || null,
      };
      if (editing.id) {
        await api.put(`/admin/leaderboard/${editing.id}`, payload);
        toast.success("Updated.");
      } else {
        await api.post("/admin/leaderboard", payload);
        toast.success("Created.");
      }
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (e: Entry) => {
    if (!confirm(`Delete "${e.name}"?`)) return;
    setBusy(e.id);
    try {
      await api.delete(`/admin/leaderboard/${e.id}`);
      toast.success("Deleted.");
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Leaderboard"
        description="Manually-curated yearly leaderboard. Set rank_position to control order."
        actions={
          <Button onClick={() => setEditing({ ...empty })}>
            <Plus className="mr-2 h-4 w-4" /> Add entry
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
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">CF</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Wins</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-muted-foreground">{r.rank_position ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.batch ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.cf_handle ?? "—"}</td>
                  <td className="px-4 py-3">{r.rating}</td>
                  <td className="px-4 py-3">{r.wins}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.year}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEditing({
                            id: r.id,
                            name: r.name,
                            batch: r.batch ?? "",
                            cf_handle: r.cf_handle ?? "",
                            rating: r.rating,
                            max_rating: r.max_rating,
                            wins: r.wins,
                            contests_participated: r.contests_participated,
                            year: r.year,
                            rank_position: r.rank_position ?? 1,
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
                  <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No entries yet.
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
        title={editing?.id ? "Edit entry" : "Add entry"}
        size="lg"
      >
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Batch</Label>
                <Input
                  value={editing.batch}
                  onChange={(e) => setEditing({ ...editing, batch: e.target.value })}
                  placeholder="22"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Codeforces handle</Label>
              <Input
                value={editing.cf_handle}
                onChange={(e) => setEditing({ ...editing, cf_handle: e.target.value })}
                placeholder="tourist"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Rating</Label>
                <Input
                  type="number"
                  value={editing.rating}
                  onChange={(e) =>
                    setEditing({ ...editing, rating: parseInt(e.target.value || "0", 10) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Max rating</Label>
                <Input
                  type="number"
                  value={editing.max_rating}
                  onChange={(e) =>
                    setEditing({ ...editing, max_rating: parseInt(e.target.value || "0", 10) })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Wins</Label>
                <Input
                  type="number"
                  value={editing.wins}
                  onChange={(e) =>
                    setEditing({ ...editing, wins: parseInt(e.target.value || "0", 10) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Contests</Label>
                <Input
                  type="number"
                  value={editing.contests_participated}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      contests_participated: parseInt(e.target.value || "0", 10),
                    })
                  }
                />
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Rank position</Label>
                <Input
                  type="number"
                  value={editing.rank_position}
                  onChange={(e) =>
                    setEditing({ ...editing, rank_position: parseInt(e.target.value || "1", 10) })
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
