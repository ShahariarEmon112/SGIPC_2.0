const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function serverFetch<T>(
  path: string,
  opts: { revalidate?: number; cache?: RequestCache } = {}
): Promise<T | null> {
  const url = BASE + path;
  try {
    const res = await fetch(url, {
      next: { revalidate: opts.revalidate ?? 60 },
      ...(opts.cache ? { cache: opts.cache } : {}),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json?.success !== true) return null;
    return json.data as T;
  } catch {
    return null;
  }
}
