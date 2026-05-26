import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { serverFetch } from "@/lib/server-api";
import type { SiteSettings } from "@/types/api";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await serverFetch<SiteSettings>("/settings");
  return (
    <>
      <Navbar />
      <div className="pt-16">{children}</div>
      <Footer settings={settings} />
    </>
  );
}
