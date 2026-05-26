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

type Event = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  location: string | null;
  image_url: string | null;
  is_published: boolean;
};

type FormState = {
  id?: number;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url: string | null;
  is_published: boolean;
};

const empty: FormState = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  image_url: null,
  is_published: true,
};

export default function AdminEventsPage() {
  const api = useApi();
  const [rows, setRows] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/events");
      setRows(res.data.data);
    } catch {
      toast.error("Failed to load events.");
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
    if (!editing.title.trim() || !editing.description.trim() || !editing.event_date) {
      toast.error("Title, description, and date are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: editing.title,
        description: editing.description,
        event_date: editing.event_date,
        location: editing.location || null,
        image_url: editing.image_url,
        is_published: editing.is_published,
      };
      if (editing.id) {
        await api.put(`/admin/events/${editing.id}`, payload);
        toast.success("Event updated.");
      } else {
        await api.post("/admin/events", payload);
        toast.success("Event created.");
      }
      setEditing(null);
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (e: Event) => {
    if (!confirm(`Delete "${e.title}"?`)) return;
    setBusy(e.id);
    try {
      await api.delete(`/admin/events/${e.id}`);
      toast.success("Deleted.");
      load();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setBusy(null);
    }
  };

  const togglePublish = async (e: Event) => {
    setBusy(e.id);
    try {
      await api.patch(`/admin/events/${e.id}/toggle-publish`);
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
        title="Events"
        description="Add, edit, publish or unpublish past and upcoming events."
        actions={
          <Button onClick={() => setEditing({ ...empty })}>
            <Plus className="mr-2 h-4 w-4" /> New event
          </Button>
        }
      />

      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(r.event_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{r.location ?? "—"}</td>
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
                            event_date: r.event_date.slice(0, 10),
                            location: r.location ?? "",
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
                    No events yet — click "New event" above to create one.
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
        title={editing?.id ? "Edit event" : "New event"}
        size="lg"
      >
        {editing && (
          <div className="space-y-4">
            <Field label="Title">
              <Input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <textarea
                rows={4}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Event date">
                <Input
                  type="date"
                  value={editing.event_date}
                  onChange={(e) => setEditing({ ...editing, event_date: e.target.value })}
                />
              </Field>
              <Field label="Location">
                <Input
                  value={editing.location}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                />
              </Field>
            </div>
            <ImageUpload
              folder="sgipc/events"
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

function Loading() {
  return (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
