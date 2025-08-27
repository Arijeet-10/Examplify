"use client";

import { AdminHeader } from "@/components/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex flex-col min-h-screen">
      <AdminHeader />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
