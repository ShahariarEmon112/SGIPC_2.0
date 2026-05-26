"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/lib/useApi";
import { cn } from "@/lib/utils";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  className?: string;
  label?: string;
  multiple?: false;
};

type MultiProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  className?: string;
  label?: string;
  multiple: true;
};

export function ImageUpload(props: Props | MultiProps) {
  const api = useApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("folder", props.folder ?? "sgipc");
    const res = await api.post("/upload/image", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data?.url as string;
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      if (props.multiple) {
        const urls: string[] = [];
        for (const f of Array.from(files)) {
          urls.push(await upload(f));
        }
        props.onChange([...(props.value ?? []), ...urls]);
        toast.success(`${urls.length} image(s) uploaded.`);
      } else {
        const url = await upload(files[0]);
        (props as Props).onChange(url);
        toast.success("Image uploaded.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  if (props.multiple) {
    return (
      <div className={cn("space-y-3", props.className)}>
        {props.label && <div className="text-sm font-medium">{props.label}</div>}
        <div className="grid grid-cols-3 gap-2">
          {(props.value ?? []).map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-md border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => props.onChange(props.value.filter((u) => u !== url))}
                className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-destructive"
                aria-label="Remove"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
            <span className="mt-1">Add</span>
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    );
  }

  const single = props as Props;
  return (
    <div className={cn("space-y-2", single.className)}>
      {single.label && <div className="text-sm font-medium">{single.label}</div>}
      {single.value ? (
        <div className="relative inline-block overflow-hidden rounded-md border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={single.value} alt="" className="h-32 w-auto" />
          <button
            type="button"
            onClick={() => single.onChange(null)}
            className="absolute right-1 top-1 rounded-full bg-background/80 p-1 text-muted-foreground hover:text-destructive"
            aria-label="Remove"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-48 flex-col items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="mt-1">Upload image</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
