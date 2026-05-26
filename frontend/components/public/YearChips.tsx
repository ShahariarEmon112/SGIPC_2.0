"use client";

import { cn } from "@/lib/utils";

export function YearChips({
  years,
  value,
  onChange,
}: {
  years: number[];
  value: number | "all";
  onChange: (v: number | "all") => void;
}) {
  if (years.length <= 1) return null;
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Chip active={value === "all"} onClick={() => onChange("all")}>
        All
      </Chip>
      {years.map((y) => (
        <Chip key={y} active={value === y} onClick={() => onChange(y)}>
          {y}
        </Chip>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
