import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/cms/actions";

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
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-faded">Portfolio CMS</p>
        <h1 className="mt-1 font-display text-[22px] leading-tight text-ink">{title}</h1>
        {status}
      </header>
      <AdminNav />
      <main className="px-4 py-6 sm:px-6">{children}</main>
    </>
  );
}
