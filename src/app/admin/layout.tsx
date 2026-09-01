import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/cms/actions";

export const metadata: Metadata = {
  title: "Editor — Opening Preparation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell min-h-screen text-ink">
      <div className="relative z-[1] mx-auto max-w-4xl px-3 py-6 sm:px-5">
        <div className="sheet">
          {children}
        </div>
      </div>
    </div>
  );
}

export async function AdminFrame({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <>
      <header className="border-b-2 border-ink px-4 py-3 sm:px-6">
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-faded">Private editor</p>
        <h1 className="masthead-title mt-1">{title}</h1>
      </header>
      <AdminNav />
      <div className="px-4 py-6 sm:px-6">{children}</div>
    </>
  );
}
