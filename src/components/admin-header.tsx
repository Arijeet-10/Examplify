
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpenCheck, LogOut, User } from "lucide-react";
import Link from "next/link";
import { AdminNav } from "./admin-nav";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { PanelLeft } from "lucide-react";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <Link
        href="/admin/exams"
        className="mr-6 hidden items-center space-x-2 md:flex"
      >
        <BookOpenCheck className="h-6 w-6 text-primary" />
        <span className="font-bold font-headline text-lg">Examplify</span>
      </Link>
      
      <div className="md:hidden">
         <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60 p-2">
                 <div className="p-2 border-b mb-2">
                     <Link href="/admin/exams" className="flex items-center gap-2">
                        <BookOpenCheck className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline text-lg">Examplify</span>
                    </Link>
                </div>
                <AdminNav isMobile={true} />
            </SheetContent>
         </Sheet>
      </div>

      <div className="hidden md:block">
        <AdminNav />
      </div>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src="https://picsum.photos/100" alt="Admin" data-ai-hint="person face" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/admin/students">
                <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <Link href="/">
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
