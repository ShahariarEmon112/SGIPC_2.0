"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Dialog } from "@/components/admin/Dialog";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GalleryItem = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  contest_name: string | null;
  year: number | null;
  is_published: boolean;
};

export default function AdminGalleryPage() {
  const api = useApi();
  const [rows, setRows] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [meta, setMeta] = useState({
    title: "",
    description: "",
    contest_name: "",
    year: new Date().getFullYear(),
  });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/gallery");
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

  const submit = async () => {
    if (urls.length === 0) {
      toast.error("Upload at least one image first.");
      return;
    }
    if (!meta.title.trim()) {
      toast.error("Provide a title.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        items: urls.map((url) => ({
          title: meta.title,
          description: meta.description || null,
          image_url: url,
          contest_name: meta.contest_name || null,
          year: meta.year || null,
          is_published: true,
        })),
      };
      await api.post("/admin/gallery", payload);
      toast.success(`${urls.length} item(s) added.`);
      setAdding(false);
      setUrls([]);
      setMeta({ title: "", description: "", contest_name: "", year: new Date().getFullYear() });
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (g: GalleryItem) => {
    if (!confirm(`Delete "${g.title}"?`)) return;
    setBusy(g.id);
    try {
      await api.delete(`/admin/gallery/${g.id}`);
      toast.success("Deleted.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const togglePublish = async (g: GalleryItem) => {
    setBusy(g.id);
    try {
      await api.patch(`/admin/gallery/${g.id}/toggle-publish`);
      load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Upload team photos. Multiple images share the same title/contest metadata."
        actions={
          <Button onClick={() => setAdding(true)}>
            <Plus className="mr-2 h-4 w-4" /> Upload photos
          </Button>
        }
      />

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-md border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          No photos yet — click "Upload photos" above.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {rows.map((g) => (
            <div key={g.id} className="group relative overflow-hidden rounded-lg border border-border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={g.image_url} alt={g.title} className="aspect-square w-full object-cover" />
              <div className="p-3 text-xs">
                <div className="line-clamp-1 font-medium">{g.title}</div>
                <div className="text-muted-foreground">
                  {g.contest_name ?? "—"}
                  {g.year ? ` · ${g.year}` : ""}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <PublishToggle
                    isPublished={g.is_published}
                    onChange={() => togglePublish(g)}
                    disabled={busy === g.id}
                  />
                  <button
                    type="button"
                    onClick={() => destroy(g)}
                    disabled={busy === g.id}
                    className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={adding}
        onClose={() => {
          setAdding(false);
          setUrls([]);
        }}
        title="Upload gallery photos"
        size="lg"
      >
        <div className="space-y-4">
          <ImageUpload
            multiple
            folder="sgipc/gallery"
            label="Images"
            value={urls}
            onChange={setUrls}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={meta.title}
                onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                placeholder="Team Photo - ICPC Dhaka 2024"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Year</Label>
              <Input
                type="number"
                value={meta.year}
                onChange={(e) => setMeta({ ...meta, year: parseInt(e.target.value || "0", 10) })}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Contest name</Label>
            <Input
              value={meta.contest_name}
              onChange={(e) => setMeta({ ...meta, contest_name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <textarea
              rows={2}
              value={meta.description}
              onChange={(e) => setMeta({ ...meta, description: e.target.value })}
              className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAdding(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={saving || urls.length === 0}>
              {saving ? "Saving…" : `Save ${urls.length || ""} item${urls.length === 1 ? "" : "s"}`}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
