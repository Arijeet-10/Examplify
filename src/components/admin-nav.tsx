
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  BarChart,
} from "lucide-react";

const navItems = [
  { href: "/admin/exams", label: "Exams", icon: FileText },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/monitoring", label: "Monitoring", icon: BarChart },
];

export function AdminNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex items-center space-x-4 lg:space-x-6",
        isMobile && "flex-col space-x-0 space-y-2 items-start"
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname.startsWith(item.href)
              ? "text-primary"
              : "text-muted-foreground",
             isMobile && "flex items-center gap-2 p-2 rounded-md w-full"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
