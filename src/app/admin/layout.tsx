import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio CMS — Opening Preparation",
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

