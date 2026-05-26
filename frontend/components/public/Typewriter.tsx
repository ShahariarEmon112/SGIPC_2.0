"use client";

import { useEffect, useState } from "react";

export function Typewriter({
  text,
  speedMs = 60,
  className,
}: {
  text: string;
  speedMs?: number;
  className?: string;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    setShown("");
    const t = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speedMs);
    return () => clearInterval(t);
  }, [text, speedMs]);

  return (
    <span className={className}>
      {shown}
      <span className="ml-1 inline-block h-[0.9em] w-[2px] animate-pulse bg-primary align-middle" />
    </span>
  );
}
