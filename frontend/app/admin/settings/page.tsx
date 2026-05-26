"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TEXT_FIELDS: { key: string; label: string; multiline?: boolean }[] = [
  { key: "hero_title", label: "Hero title" },
  { key: "hero_subtitle", label: "Hero subtitle" },
  { key: "hero_cta_primary", label: "Hero CTA — primary" },
  { key: "hero_cta_secondary", label: "Hero CTA — secondary" },
  { key: "about_title", label: "About section title" },
  { key: "club_motto", label: "Club motto" },
  { key: "club_mission", label: "Club mission", multiline: true },
  { key: "club_vision", label: "Club vision", multiline: true },
  { key: "stat_members", label: "Stat: members" },
  { key: "stat_events", label: "Stat: events" },
  { key: "stat_achievements", label: "Stat: achievements" },
  { key: "stat_since", label: "Stat: active since" },
  { key: "footer_description", label: "Footer description", multiline: true },
  { key: "footer_email", label: "Footer email" },
  { key: "footer_facebook", label: "Footer Facebook URL" },
  { key: "footer_github", label: "Footer GitHub URL" },
];

export default function SettingsPage() {
  const api = useApi();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/admin/settings")
      .then((res) => {
        const map: Record<string, string> = {};
        (res.data.data as Array<{ key: string; value: string | null }>).forEach((r) => {
          map[r.key] = r.value ?? "";
        });
        setValues(map);
      })
      .catch(() => toast.error("Failed to load settings."))
      .finally(() => setLoading(false));
  }, [api]);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        settings: Object.entries(values).map(([key, value]) => ({
          key,
          value,
          type: "text",
        })),
      };
      await api.post("/admin/settings", payload);
      toast.success("Settings saved. Refresh the public site to see changes.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Site Settings" />
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Site Settings"
        description="Public-facing copy. Changes go live immediately (cached up to 60s)."
        actions={
          <Button onClick={save} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <div className="mb-10">
        <Label className="mb-2 block">About content (rich text)</Label>
        <RichTextEditor
          value={values.about_content ?? ""}
          onChange={(html) => setValues((v) => ({ ...v, about_content: html }))}
          minHeight="14rem"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This block is rendered on the home page preview and the /about page.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {TEXT_FIELDS.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label>{f.label}</Label>
            {f.multiline ? (
              <textarea
                rows={4}
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm"
              />
            ) : (
              <Input
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </>
  );
}
