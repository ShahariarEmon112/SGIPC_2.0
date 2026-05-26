"use client";

import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublishToggle({
  isPublished,
  onChange,
  disabled,
}: {
  isPublished: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors disabled:opacity-50",
        isPublished
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-muted-foreground/30 text-muted-foreground"
      )}
      aria-label={isPublished ? "Unpublish" : "Publish"}
    >
      {isPublished ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {isPublished ? "Published" : "Hidden"}
    </button>
  );
}
