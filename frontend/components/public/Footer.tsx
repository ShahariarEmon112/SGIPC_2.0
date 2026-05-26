import Link from "next/link";
import { Mail } from "lucide-react";
import type { SiteSettings } from "@/types/api";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2c-3.22.7-3.9-1.38-3.9-1.38-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.74 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.57-.3-5.27-1.28-5.27-5.7 0-1.26.45-2.3 1.18-3.1-.12-.3-.51-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.5 3.17-1.18 3.17-1.18.63 1.6.24 2.77.12 3.07.73.8 1.18 1.84 1.18 3.1 0 4.44-2.7 5.4-5.28 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.67.8.55A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M13.5 21.95V13.5h2.86l.43-3.32H13.5V8.04c0-.96.27-1.62 1.65-1.62l1.76 0V3.45c-.3-.04-1.35-.13-2.57-.13-2.54 0-4.28 1.55-4.28 4.4v2.46H7.2v3.32h2.86v8.45h3.44Z" />
    </svg>
  );
}

const quickLinks = [
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/contest", label: "Contests" },
  { href: "/achievements", label: "Achievements" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
];

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const desc =
    settings?.footer_description ??
    "The official competitive programming club of KUET CSE.";
  const email = settings?.footer_email ?? "sgipc@kuet.ac.bd";
  const facebook = settings?.footer_facebook ?? "https://facebook.com/sgipc.kuet";
  const github = settings?.footer_github ?? "https://github.com/sgipc-kuet";
  const motto = settings?.club_motto ?? "Code. Compete. Conquer.";

  return (
    <footer className="border-t border-border bg-card/40">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <Link href="/" className="text-xl font-semibold text-primary">
              SGIPC
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
            <p className="mt-4 text-xs uppercase tracking-wider text-primary">{motto}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">Quick links</h3>
            <ul className="mt-3 space-y-2">
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium">Contact</h3>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 hover:text-primary"
              >
                <Mail className="h-4 w-4" /> {email}
              </a>
              <a
                href={facebook}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-primary"
              >
                <FacebookIcon className="h-4 w-4" /> Facebook
              </a>
              <a
                href={github}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:text-primary"
              >
                <GithubIcon className="h-4 w-4" /> GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} SGIPC Club · KUET CSE · Built with Next.js + Laravel
        </div>
      </div>
    </footer>
  );
}
