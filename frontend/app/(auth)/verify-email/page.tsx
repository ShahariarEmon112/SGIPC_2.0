"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type State =
  | { kind: "loading" }
  | { kind: "success"; alreadyVerified: boolean }
  | { kind: "error"; message: string };

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    if (!token) {
      setState({ kind: "error", message: "Missing verification token." });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/verify-email", { params: { token } });
        if (cancelled) return;
        if (res.data?.success) {
          setState({
            kind: "success",
            alreadyVerified: Boolean(res.data?.data?.already_verified),
          });
        } else {
          setState({ kind: "error", message: res.data?.message ?? "Verification failed." });
        }
      } catch (err: any) {
        if (cancelled) return;
        setState({
          kind: "error",
          message: err?.response?.data?.message ?? "Verification failed.",
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle>
          {state.kind === "loading" && "Verifying…"}
          {state.kind === "success" &&
            (state.alreadyVerified ? "Already verified" : "Email verified")}
          {state.kind === "error" && "Verification failed"}
        </CardTitle>
        <CardDescription>
          {state.kind === "loading" && "Checking your verification token."}
          {state.kind === "success" &&
            (state.alreadyVerified
              ? "Your email was already confirmed."
              : "Your email is confirmed. An admin will review your application and notify you when approved.")}
          {state.kind === "error" && state.message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {state.kind === "success" && (
          <Button asChild className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        )}
        {state.kind === "error" && (
          <Button asChild variant="outline" className="w-full">
            <Link href="/register">Back to registration</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
