"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  // Login page renders without sidebar or banner
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 ml-64 bg-gray-50">
        {/* Demo environment banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-8 py-2.5 flex items-center gap-2 text-amber-800 text-xs">
          <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong className="font-semibold">Demo Environment</strong> — All data is fictional and seeded for demonstration purposes. No real transactions occur.
          </span>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
