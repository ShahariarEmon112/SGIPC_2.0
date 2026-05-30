"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialEmail = params.get("email") ?? "";

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Enter the 6-digit code.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/verify-email", { email, code });
      if (res.data?.success) {
        setVerified(true);
        toast.success(res.data.message ?? "Email verified.");
      } else {
        toast.error(res.data?.message ?? "Verification failed.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setResending(true);
    try {
      const res = await api.post("/resend-verification", { email });
      if (res.data?.success) {
        toast.success(res.data.message ?? "Code sent.");
      } else {
        toast.error(res.data?.message ?? "Could not resend code.");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  if (verified) {
    return (
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader>
          <CardTitle>Email verified</CardTitle>
          <CardDescription>
            Your email is confirmed. An admin will review your application and notify you when
            approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to your inbox. Enter it below to confirm your address.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="verify-email-input">Email</Label>
            <Input
              id="verify-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@student.kuet.ac.bd"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="verify-code-input">6-digit code</Label>
            <Input
              id="verify-code-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="text-center font-mono text-2xl tracking-[0.6em]"
              autoFocus
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Verifying…" : "Verify email"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onResend}
            disabled={resending}
          >
            {resending ? "Sending…" : "Resend code"}
          </Button>
          <p className="pt-2 text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
