"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<{ code?: string; message?: string } | null>(null);

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: Form) => {
    setSubmitting(true);
    setServerError(null);
    try {
      // Hit the Laravel endpoint directly first so we can read the structured error code.
      const res = await api.post("/login", data);
      if (!res.data?.success) {
        setServerError({ code: res.data?.data?.code, message: res.data?.message });
        return;
      }
      // Token + user came back — also create a NextAuth session for client routing.
      const next = await signIn("credentials", { redirect: false, ...data });
      if (next?.error) {
        setServerError({ message: "Session creation failed. Try again." });
        return;
      }
      toast.success("Logged in.");
      const redirectTo = params.get("callbackUrl") ?? "/";
      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      const body = err?.response?.data;
      setServerError({ code: body?.data?.code, message: body?.message ?? "Login failed" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Log in to your SGIPC account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input {...form.register("email")} type="email" autoFocus />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input {...form.register("password")} type="password" />
            {form.formState.errors.password && (
              <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          {serverError && <ServerError code={serverError.code} message={serverError.message} />}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Logging in…" : "Log in"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            No account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function ServerError({ code, message }: { code?: string; message?: string }) {
  const headline = (() => {
    switch (code) {
      case "email_not_verified":
        return "Email not verified";
      case "account_pending":
        return "Pending approval";
      case "account_rejected":
        return "Registration rejected";
      case "invalid_credentials":
        return "Invalid credentials";
      default:
        return "Login failed";
    }
  })();

  return (
    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
      <div className="font-medium text-destructive">{headline}</div>
      {message && <div className="mt-0.5 text-destructive/90">{message}</div>}
    </div>
  );
}
