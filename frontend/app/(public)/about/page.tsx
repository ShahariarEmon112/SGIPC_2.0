import { serverFetch } from "@/lib/server-api";
import type { SiteSettings } from "@/types/api";

export const metadata = { title: "About · SGIPC" };

export default async function AboutPage() {
  const settings = await serverFetch<SiteSettings>("/settings");

  return (
    <main className="container py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-primary">About SGIPC</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight md:text-5xl">
          {settings?.about_title ?? "About SGIPC"}
        </h1>
        <div
          className="mt-8 space-y-4 text-muted-foreground [&_code]:rounded [&_code]:bg-accent [&_code]:px-1 [&_code]:py-0.5"
          dangerouslySetInnerHTML={{
            __html: settings?.about_content ?? "",
          }}
        />

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          <Block label="Motto" body={settings?.club_motto ?? "—"} accent />
          <Block label="Mission" body={settings?.club_mission ?? "—"} />
          <Block label="Vision" body={settings?.club_vision ?? "—"} />
        </div>
      </div>
    </main>
  );
}

function Block({ label, body, accent = false }: { label: string; body: string; accent?: boolean }) {
  return (
    <div
      className={`rounded-xl border bg-card p-6 ${
        accent ? "border-primary/40" : "border-border"
      }`}
    >
      <div className="text-xs uppercase tracking-wider text-primary">{label}</div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
