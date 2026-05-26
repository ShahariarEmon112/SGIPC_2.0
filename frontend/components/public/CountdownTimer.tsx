"use client";

import { useEffect, useState } from "react";

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    done: ms === 0,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

export function CountdownTimer({ target }: { target: string | Date }) {
  const targetDate = typeof target === "string" ? new Date(target) : target;
  const [t, setT] = useState(() => diff(targetDate));

  useEffect(() => {
    const i = setInterval(() => setT(diff(targetDate)), 1000);
    return () => clearInterval(i);
  }, [targetDate]);

  if (t.done) {
    return <span className="text-sm text-muted-foreground">Contest is live or finished.</span>;
  }

  return (
    <div className="flex gap-3 font-mono text-sm">
      <Cell n={t.d} label="days" />
      <Cell n={t.h} label="hrs" />
      <Cell n={t.m} label="min" />
      <Cell n={t.s} label="sec" />
    </div>
  );
}

function Cell({ n, label }: { n: number; label: string }) {
  return (
    <div className="flex w-14 flex-col items-center rounded-md border border-border bg-background/40 px-2 py-1.5">
      <span className="text-lg font-semibold text-primary">{String(n).padStart(2, "0")}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
