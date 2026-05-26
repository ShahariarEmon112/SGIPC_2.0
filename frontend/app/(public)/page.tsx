import Link from "next/link";
import { Trophy, Calendar, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatrixRain } from "@/components/public/MatrixRain";
import { Typewriter } from "@/components/public/Typewriter";
import { CountdownTimer } from "@/components/public/CountdownTimer";
import { SectionHeader } from "@/components/public/SectionHeader";
import { BlogCard } from "@/components/public/BlogCard";
import { serverFetch } from "@/lib/server-api";
import type {
  Achievement,
  BlogPage,
  ContestsResponse,
  GalleryItem,
  SiteSettings,
} from "@/types/api";

export default async function HomePage() {
  const [settings, contests, achievements, blogs, gallery] = await Promise.all([
    serverFetch<SiteSettings>("/settings"),
    serverFetch<ContestsResponse>("/contests"),
    serverFetch<Achievement[]>("/achievements"),
    serverFetch<BlogPage>("/blogs"),
    serverFetch<GalleryItem[]>("/gallery"),
  ]);

  const heroTitle = settings?.hero_title ?? "SGIPC Club of KUET";
  const heroSubtitle =
    settings?.hero_subtitle ?? "Where contest programmers knot ties together";
  const ctaPrimary = settings?.hero_cta_primary ?? "Join Now";
  const ctaSecondary = settings?.hero_cta_secondary ?? "Learn More";

  const upcoming = contests?.upcoming?.[0];
  const topAchievements = (achievements ?? []).slice(0, 3);
  const topBlogs = (blogs?.data ?? []).slice(0, 3);
  const galleryPreview = (gallery ?? []).slice(0, 4);

  return (
    <>
      {/* ───────────────────── Hero ───────────────────── */}
      <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
        <div className="absolute inset-0">
          <MatrixRain />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        <div className="container relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20 text-center">
          <div className="max-w-3xl space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary">
              <Sparkles className="h-3 w-3" />
              KUET CSE · Est. {settings?.stat_since ?? "2015"}
            </div>
            <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-7xl">
              <Typewriter text={heroTitle} />
            </h1>
            <p className="text-balance text-lg text-muted-foreground md:text-xl">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button asChild size="lg">
                <Link href="/register">{ctaPrimary}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/about">{ctaSecondary}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── Stats bar ───────────────────── */}
      <section className="border-y border-border bg-card/40">
        <div className="container grid grid-cols-2 gap-y-8 py-12 md:grid-cols-4">
          <Stat icon={<Users className="h-5 w-5" />} value={settings?.stat_members ?? "—"} label="Members" />
          <Stat icon={<Calendar className="h-5 w-5" />} value={settings?.stat_events ?? "—"} label="Events" />
          <Stat icon={<Trophy className="h-5 w-5" />} value={settings?.stat_achievements ?? "—"} label="Achievements" />
          <Stat icon={<Sparkles className="h-5 w-5" />} value={settings?.stat_since ?? "—"} label="Active since" />
        </div>
      </section>

      {/* ───────────────────── About preview ───────────────────── */}
      <section className="container py-20">
        <div className="grid items-center gap-10 md:grid-cols-5">
          <div className="md:col-span-3">
            <SectionHeader
              eyebrow="About SGIPC"
              title={settings?.about_title ?? "About SGIPC"}
            />
            <div
              className="prose prose-invert max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{
                __html:
                  settings?.about_content ??
                  "<p>The Special Group Interested in Programming Contest is the official competitive programming club of KUET.</p>",
              }}
            />
            <Link
              href="/about"
              className="mt-6 inline-block text-sm text-primary hover:underline"
            >
              Read full mission and vision →
            </Link>
          </div>
          <div className="md:col-span-2">
            <div className="rounded-2xl border border-primary/30 bg-card p-6">
              <div className="text-xs uppercase tracking-wider text-primary">Club motto</div>
              <p className="mt-2 text-2xl font-semibold leading-tight">
                {settings?.club_motto ?? "Code. Compete. Conquer."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────── Upcoming contest ───────────────────── */}
      {upcoming && (
        <section className="container py-12">
          <SectionHeader
            eyebrow="Next up"
            title="Upcoming contest"
            more={{ href: "/contest", label: "All contests" }}
          />
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-primary">
                  {upcoming.platform ?? "Online"} ·{" "}
                  {new Date(upcoming.contest_date).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
                <h3 className="mt-2 text-2xl font-semibold">{upcoming.title}</h3>
                <p className="mt-2 line-clamp-2 text-muted-foreground">{upcoming.description}</p>
              </div>
              <div className="flex flex-col items-start gap-4 md:items-end">
                <CountdownTimer target={upcoming.contest_date} />
                {upcoming.registration_link && (
                  <Button asChild>
                    <a href={upcoming.registration_link} target="_blank" rel="noreferrer">
                      Register on {upcoming.platform ?? "platform"}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───────────────────── Recent achievements ───────────────────── */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="Recent wins"
          title="Achievements"
          more={{ href: "/achievements", label: "Full hall of fame" }}
        />
        <div className="grid gap-5 md:grid-cols-3">
          {topAchievements.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
                <Trophy className="h-3 w-3" /> {a.position} · {a.year}
              </div>
              <h3 className="mt-3 font-semibold leading-snug">{a.contest_name}</h3>
              {a.members?.length > 0 && (
                <p className="mt-2 text-sm text-muted-foreground">{a.members.join(" · ")}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────────── Latest blogs ───────────────────── */}
      <section className="container py-20">
        <SectionHeader
          eyebrow="From the club"
          title="Latest blog posts"
          more={{ href: "/blog", label: "All posts" }}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {topBlogs.map((b) => (
            <BlogCard key={b.id} blog={b} />
          ))}
        </div>
      </section>

      {/* ───────────────────── Gallery preview ───────────────────── */}
      <section className="container pb-24">
        <SectionHeader
          eyebrow="Team moments"
          title="From the gallery"
          more={{ href: "/gallery", label: "Full gallery" }}
        />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {galleryPreview.map((g) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={g.id}
              src={g.image_url}
              alt={g.title}
              className="aspect-square w-full rounded-xl object-cover transition-transform hover:scale-[1.02]"
            />
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="text-primary">{icon}</div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
