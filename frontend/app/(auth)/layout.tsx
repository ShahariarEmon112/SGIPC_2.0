import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <Link href="/" className="mb-8 text-sm text-muted-foreground hover:text-primary transition-colors">
        ← Back to home
      </Link>
      {children}
    </main>
  );
}
