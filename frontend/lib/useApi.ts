"use client";

import { useMemo } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";

export function useApi() {
  const { data: session } = useSession();
  const token = (session as any)?.apiToken as string | undefined;

  return useMemo(
    () =>
      axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }),
    [token]
  );
}
