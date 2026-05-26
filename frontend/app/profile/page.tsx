"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Save, Heart, MessageCircle, Eye, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { cn } from "@/lib/utils";
import type { MyBlog, MyComment } from "@/types/api-extra";

type Me = {
  id: number;
  name: string;
  email: string;
  role: string;
  student_id: string;
  batch: string;
  department: string;
  profile_photo_url: string | null;
  status: string;
};

export default function ProfilePage() {
  const { update } = useSession();
  const api = useApi();
  const [me, setMe] = useState<Me | null>(null);
  const [blogs, setBlogs] = useState<MyBlog[]>([]);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/me").then((r) => r.data.data as Me),
      api.get("/me/blogs").then((r) => r.data.data as MyBlog[]),
      api.get("/me/comments").then((r) => r.data.data as MyComment[]),
    ])
      .then(([u, b, c]) => {
        setMe(u);
        setName(u.name);
        setPhoto(u.profile_photo_url);
        setBlogs(b);
        setComments(c);
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, [api]);

  const save = async () => {
    if (!me) return;
    if (name.trim().length < 2) {
      toast.error("Name is too short.");
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch("/me", { name, profile_photo_url: photo });
      const updated = res.data.data as Me;
      setMe({ ...me, ...updated });
      toast.success("Profile updated.");
      await update({ name: updated.name });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="container py-16">
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  if (!me) return null;

  const dirty = name !== me.name || photo !== me.profile_photo_url;

  return (
    <main className="container py-16">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-wider text-primary">Your profile</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{me.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{me.email}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Edit profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                folder="sgipc/profiles"
                label="Profile photo"
                value={photo}
                onChange={setPhoto}
              />
              <div className="space-y-1.5">
                <Label>Display name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={me.email} disabled />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label>Student ID</Label>
                  <Input value={me.student_id} disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Batch</Label>
                  <Input value={me.batch} disabled />
                </div>
              </div>
              <Button onClick={save} disabled={!dirty || saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 lg:col-span-2">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Your blog posts</h2>
            {blogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">You haven't written any posts yet.</p>
            ) : (
              <div className="space-y-3">
                {blogs.map((b) => (
                  <article
                    key={b.id}
                    className="rounded-md border border-border bg-card p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        {b.status === "approved" && b.is_published ? (
                          <Link
                            href={`/blog/${b.slug}`}
                            className="font-medium hover:text-primary"
                          >
                            {b.title}
                          </Link>
                        ) : (
                          <span className="font-medium">{b.title}</span>
                        )}
                        <div className="mt-1 text-xs text-muted-foreground">
                          {new Date(b.created_at).toLocaleDateString()}
                        </div>
                        {b.rejection_reason && (
                          <div className="mt-1 text-xs text-destructive">
                            Reason: {b.rejection_reason}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={b.status} />
                    </div>
                    {b.status === "approved" && (
                      <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {b.likes_count}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {b.comments_count}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {b.views_count}
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Your recent comments</h2>
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              <div className="space-y-3">
                {comments.map((c) => (
                  <article
                    key={c.id}
                    className="rounded-md border border-border bg-card p-4"
                  >
                    <div className="mb-1 text-xs text-muted-foreground">
                      On{" "}
                      <Link
                        href={`/blog/${c.blog.slug}`}
                        className="hover:text-primary"
                      >
                        {c.blog.title}
                      </Link>{" "}
                      · {new Date(c.created_at).toLocaleDateString()}
                    </div>
                    <p className="text-sm">{c.content}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: MyBlog["status"] }) {
  const styles = {
    approved: "border-primary/40 bg-primary/10 text-primary",
    pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
    rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}
