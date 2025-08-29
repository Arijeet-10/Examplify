
"use client";

import { AdminHeader } from "@/components/admin-header";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auto-logout after 10 minutes of inactivity
  useIdleTimeout();

  return (
    <div className="bg-background flex flex-col min-h-screen">
      <AdminHeader />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
