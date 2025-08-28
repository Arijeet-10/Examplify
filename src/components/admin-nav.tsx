
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FileText,
  Users,
  BarChart,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/exams", label: "Exams", icon: FileText },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/monitoring", label: "Monitoring", icon: BarChart },
];

export function AdminNav({ isMobile = false }: { isMobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex items-center space-x-2 lg:space-x-4",
        isMobile && "flex-col space-x-0 space-y-1 items-stretch"
      )}
    >
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            pathname.startsWith(item.href)
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground",
             isMobile && "w-full justify-start"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
