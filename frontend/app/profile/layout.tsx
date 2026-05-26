import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Navbar } from "@/components/public/Navbar";

export const metadata = { title: "Profile · SGIPC" };

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/profile");
  return (
    <>
      <Navbar />
      <div className="pt-16">{children}</div>
    </>
  );
}
