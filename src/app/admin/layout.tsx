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
        <div className="sheet">{children}</div>
      </div>
    </div>
  );
}

export async function AdminFrame({
  title,
  children,
  status,
}: {
  title: string;
  children: React.ReactNode;
  status?: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <>
      <header className="border-b-2 border-ink px-4 py-3 sm:px-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faded">Editor</p>
        <h1 className="mt-1 font-display text-[22px] leading-tight text-ink">{title}</h1>
        {status}
      </header>
      <AdminNav />
      <main className="px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
