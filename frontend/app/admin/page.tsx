"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  Trophy,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  Flag,
  ArrowRight,
  Clock,
  CheckCheck,
} from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type Stats = {
  members: { total: number; pending: number; approved: number; rejected: number };
  blogs: { total: number; pending: number; approved: number; rejected: number };
  content: { events: number; contests: number; achievements: number; gallery: number };
  moderation: { comments_total: number; comments_reported: number; reports_pending: number };
};

export default function AdminDashboard() {
  const api = useApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data.data))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) {
    return (
      <>
        <AdminPageHeader title="Dashboard" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border border-border bg-card" />
          ))}
        </div>
      </>
    );
  }

  if (!stats) {
    return (
      <>
        <AdminPageHeader title="Dashboard" />
        <p className="text-muted-foreground">Failed to load stats.</p>
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="At-a-glance health of the SGIPC site and moderation queue."
      />

      {/* Action queue: things that need attention */}
      {(stats.members.pending > 0 ||
        stats.blogs.pending > 0 ||
        stats.moderation.reports_pending > 0) && (
        <section className="mb-10">
          <h2 className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Clock className="h-4 w-4" /> Needs your attention
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {stats.members.pending > 0 && (
              <ActionCard
                href="/admin/members?status=pending"
                count={stats.members.pending}
                label="Pending member approvals"
              />
            )}
            {stats.blogs.pending > 0 && (
              <ActionCard
                href="/admin/blogs?status=pending"
                count={stats.blogs.pending}
                label="Blog posts awaiting review"
              />
            )}
            {stats.moderation.reports_pending > 0 && (
              <ActionCard
                href="/admin/reports?status=pending"
                count={stats.moderation.reports_pending}
                label="Pending comment reports"
              />
            )}
          </div>
        </section>
      )}

      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Members</h2>
      <div className="mb-8 grid gap-3 md:grid-cols-4">
        <Stat icon={Users} label="Total" value={stats.members.total} />
        <Stat icon={CheckCheck} label="Approved" value={stats.members.approved} />
        <Stat icon={Clock} label="Pending" value={stats.members.pending} tone="warn" />
        <Stat icon={Users} label="Rejected" value={stats.members.rejected} tone="muted" />
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Content</h2>
      <div className="mb-8 grid gap-3 md:grid-cols-4">
        <Stat icon={Calendar} label="Events" value={stats.content.events} />
        <Stat icon={Trophy} label="Contests" value={stats.content.contests} />
        <Stat icon={Trophy} label="Achievements" value={stats.content.achievements} />
        <Stat icon={ImageIcon} label="Gallery photos" value={stats.content.gallery} />
      </div>

      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Blogs & moderation</h2>
      <div className="grid gap-3 md:grid-cols-4">
        <Stat icon={FileText} label="Blog posts" value={stats.blogs.total} />
        <Stat icon={FileText} label="Pending blogs" value={stats.blogs.pending} tone="warn" />
        <Stat icon={MessageSquare} label="Comments" value={stats.moderation.comments_total} />
        <Stat icon={Flag} label="Reported" value={stats.moderation.comments_reported} tone="warn" />
      </div>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: any;
  label: string;
  value: number;
  tone?: "default" | "warn" | "muted";
}) {
  const accent =
    tone === "warn"
      ? "text-yellow-400"
      : tone === "muted"
        ? "text-muted-foreground"
        : "text-primary";
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className={`mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-wider ${accent}`}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-3xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

function ActionCard({
  href,
  count,
  label,
}: {
  href: string;
  count: number;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 p-5 transition-colors hover:border-primary/60"
    >
      <div>
        <div className="text-3xl font-semibold text-primary">{count}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
      <ArrowRight className="h-5 w-5 text-primary/60 group-hover:text-primary" />
    </Link>
  );
}
