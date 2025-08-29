
"use client";

import { StudentHeader } from "@/components/student-header";
import { useIdleTimeout } from "@/hooks/use-idle-timeout";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auto-logout after 10 minutes of inactivity
  useIdleTimeout();
  
  return (
    <div className="flex min-h-screen flex-col">
      <StudentHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
