import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "Admin · SGIPC" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/admin");
  if ((session.user as any)?.role !== "admin") redirect("/");

  return <AdminShell adminName={session.user?.name ?? "Admin"}>{children}</AdminShell>;
}
