"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Trash2, Mail, Loader2 } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Dialog } from "@/components/admin/Dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Member = {
  id: number;
  name: string;
  email: string;
  student_id: string;
  batch: string;
  department: string;
  status: "pending" | "approved" | "rejected";
  email_verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
};

type PaginatedMembers = {
  data: Member[];
  total: number;
  current_page: number;
  last_page: number;
};

const FILTERS = ["all", "pending", "approved", "rejected"] as const;

export default function MembersPage() {
  const params = useSearchParams();
  const initialStatus =
    (FILTERS.includes(params.get("status") as any) ? (params.get("status") as any) : "all") as
      | "all"
      | "pending"
      | "approved"
      | "rejected";

  const api = useApi();
  const [status, setStatus] = useState<typeof initialStatus>(initialStatus);
  const [data, setData] = useState<PaginatedMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<Member | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const url = status === "all" ? "/admin/members" : `/admin/members?status=${status}`;
      const res = await api.get(url);
      setData(res.data.data);
    } catch {
      toast.error("Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const approve = async (m: Member) => {
    setBusy(m.id);
    try {
      await api.patch(`/admin/members/${m.id}/approve`);
      toast.success(`${m.name} approved.`);
      load();
    } catch {
      toast.error("Failed to approve.");
    } finally {
      setBusy(null);
    }
  };

  const submitReject = async () => {
    if (!rejecting) return;
    if (reason.trim().length < 3) {
      toast.error("Reason is too short.");
      return;
    }
    setBusy(rejecting.id);
    try {
      await api.patch(`/admin/members/${rejecting.id}/reject`, { reason });
      toast.success(`${rejecting.name} rejected.`);
      setRejecting(null);
      setReason("");
      load();
    } catch {
      toast.error("Failed to reject.");
    } finally {
      setBusy(null);
    }
  };

  const destroy = async (m: Member) => {
    if (!confirm(`Permanently remove ${m.name}? This cannot be undone.`)) return;
    setBusy(m.id);
    try {
      await api.delete(`/admin/members/${m.id}`);
      toast.success("Member removed.");
      load();
    } catch {
      toast.error("Failed to remove.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Members"
        description="Approve new registrations, reject with a reason, or remove members."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatus(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
              status === f
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {f} {data && status === f ? `(${data.total})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-md border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border bg-card">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-background/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.data ?? []).map((m) => (
                <tr key={m.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{m.student_id}</div>
                    <div className="text-xs text-muted-foreground">
                      Batch {m.batch} · {m.department}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={m.status} />
                    {m.rejection_reason && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {m.rejection_reason}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {m.email_verified_at ? (
                      <span className="inline-flex items-center gap-1 text-xs text-primary">
                        <Mail className="h-3 w-3" /> verified
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">unverified</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-2">
                      {m.status !== "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => approve(m)}
                          disabled={busy === m.id}
                        >
                          <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
                        </Button>
                      )}
                      {m.status !== "rejected" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejecting(m)}
                          disabled={busy === m.id}
                        >
                          <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => destroy(m)}
                        disabled={busy === m.id}
                        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(data?.data?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No members in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog
        open={!!rejecting}
        onClose={() => {
          setRejecting(null);
          setReason("");
        }}
        title={`Reject ${rejecting?.name ?? ""}`}
        description="The member will receive an email with this reason."
      >
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejection…"
          rows={4}
          className="w-full rounded-md border border-border bg-background/50 px-3 py-2 text-sm"
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setRejecting(null);
              setReason("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={submitReject} disabled={busy !== null}>
            Reject member
          </Button>
        </div>
      </Dialog>
    </>
  );
}

function StatusBadge({ status }: { status: Member["status"] }) {
  const styles = {
    approved: "border-primary/40 bg-primary/10 text-primary",
    pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
    rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize",
        styles[status]
      )}
    >
      {status}
    </span>
  );
}
