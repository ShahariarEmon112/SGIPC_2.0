export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-2xl space-y-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Phase 1 scaffold — backend + frontend ready
        </div>
        <h1 className="text-balance text-5xl font-semibold tracking-tight md:text-6xl">
          SGIPC Club of <span className="text-primary">KUET</span>
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          Where contest programmers knot ties together.
        </p>
        <p className="text-sm text-muted-foreground">
          Public pages, auth flow, and admin panel arrive in the next phase.
        </p>
      </div>
    </main>
  );
}
