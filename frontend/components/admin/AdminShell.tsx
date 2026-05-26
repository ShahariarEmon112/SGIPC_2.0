"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Settings,
  Calendar,
  Trophy,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  Flag,
  Trophy as TrophyIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/settings", label: "Site Settings", icon: Settings },
  { href: "/admin/events", label: "Events", icon: Calendar },
  { href: "/admin/contests", label: "Contests", icon: TrophyIcon },
  { href: "/admin/achievements", label: "Achievements", icon: Trophy },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/blogs", label: "Blogs", icon: FileText },
  { href: "/admin/comments", label: "Comments", icon: MessageSquare },
  { href: "/admin/reports", label: "Reports", icon: Flag },
];

export function AdminShell({
  adminName,
  children,
}: {
  adminName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      {/* mobile topbar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
        <Link href="/admin" className="font-semibold text-primary">
          SGIPC <span className="text-muted-foreground">· Admin</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      <div className="flex">
        {/* sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-64 border-r border-border bg-card transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-16 items-center border-b border-border px-6">
            <Link href="/admin" className="text-lg font-semibold text-primary">
              SGIPC <span className="text-muted-foreground">· Admin</span>
            </Link>
          </div>
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
            {nav.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/admin"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <div className="px-3 py-2 text-xs">
              <div className="text-muted-foreground">Signed in as</div>
              <div className="truncate font-medium">{adminName}</div>
            </div>
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                ← View public site
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" }).then(() => router.refresh())}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>
        </aside>

        {open && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 bg-background/70 lg:hidden"
          />
        )}

        <main className="flex-1 px-5 py-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
