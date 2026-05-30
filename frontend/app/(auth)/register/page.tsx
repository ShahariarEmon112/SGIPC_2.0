"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const step1Schema = z.object({
  name: z.string().min(2, "Name is too short").max(100),
  student_id: z.string().min(4, "Student ID is too short").max(20),
  batch: z.string().min(1, "Batch is required").max(10),
  department: z.string().min(1).max(30),
});

const step2Schema = z
  .object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match",
  });

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form1 = useForm<Step1>({
    resolver: zodResolver(step1Schema),
    defaultValues: { name: "", student_id: "", batch: "", department: "CSE" },
  });
  const form2 = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: { email: "", password: "", password_confirmation: "" },
  });

  const onStep1 = (data: Step1) => {
    setStep1Data(data);
    setStep(2);
  };

  const onStep2 = async (data: Step2) => {
    if (!step1Data) return;
    setSubmitting(true);
    try {
      const res = await api.post("/register", { ...step1Data, ...data });
      if (res.data?.success) {
        toast.success("Account created. Check your email for the code.");
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        toast.error(res.data?.message ?? "Registration failed");
      }
    } catch (err: any) {
      const errs = err?.response?.data?.errors;
      const msg = err?.response?.data?.message ?? "Registration failed";
      if (errs) {
        Object.entries(errs).forEach(([field, messages]) => {
          form2.setError(field as any, { message: (messages as string[])[0] });
        });
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle>Join SGIPC</CardTitle>
        <CardDescription>
          {`Step ${step} of 2 — ${step === 1 ? "Personal info" : "Account setup"}`}
        </CardDescription>
        <div className="flex gap-2 pt-2" aria-hidden>
          <div className={`h-1 flex-1 rounded ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`h-1 flex-1 rounded ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 1 && (
          <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
            <Field label="Full name" error={form1.formState.errors.name?.message}>
              <Input {...form1.register("name")} placeholder="Arif Hossain" autoFocus />
            </Field>
            <Field label="Student ID" error={form1.formState.errors.student_id?.message}>
              <Input {...form1.register("student_id")} placeholder="2200123" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Batch" error={form1.formState.errors.batch?.message}>
                <Input {...form1.register("batch")} placeholder="22" />
              </Field>
              <Field label="Department" error={form1.formState.errors.department?.message}>
                <Input {...form1.register("department")} />
              </Field>
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-4">
            <Field label="KUET email" error={form2.formState.errors.email?.message}>
              <Input
                {...form2.register("email")}
                type="email"
                placeholder="2200123@student.kuet.ac.bd"
                autoFocus
              />
            </Field>
            <Field label="Password" error={form2.formState.errors.password?.message}>
              <Input {...form2.register("password")} type="password" placeholder="At least 8 characters" />
            </Field>
            <Field
              label="Confirm password"
              error={form2.formState.errors.password_confirmation?.message}
            >
              <Input {...form2.register("password_confirmation")} type="password" />
            </Field>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={submitting}>
                Back
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Creating account…" : "Create account"}
              </Button>
            </div>
          </form>
        )}

        <p className="pt-2 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
