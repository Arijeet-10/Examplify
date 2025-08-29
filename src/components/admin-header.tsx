
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
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import { AdminNav } from "./admin-nav";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { PanelLeft } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export function AdminHeader() {
  const [user] = useAuthState(auth);

  const handleLogout = () => {
    auth.signOut();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <Link
        href="/admin/dashboard"
        className="mr-6 hidden items-center space-x-2 md:flex"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
          <path d="M14.22 8.3C14.53 8.01 14.51 7.5 14.19 7.21C13.88 6.91 13.37 6.94 13.08 7.27L10.23 10.47C9.94 10.8 9.94 11.31 10.24 11.63L13.08 14.73C13.37 15.06 13.88 15.09 14.19 14.79C14.51 14.5 14.53 13.99 14.22 13.7L11.85 11.05L14.22 8.3Z" fill="currentColor"/>
        </svg>
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
                     <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                          <path d="M14.22 8.3C14.53 8.01 14.51 7.5 14.19 7.21C13.88 6.91 13.37 6.94 13.08 7.27L10.23 10.47C9.94 10.8 9.94 11.31 10.24 11.63L13.08 14.73C13.37 15.06 13.88 15.09 14.19 14.79C14.51 14.5 14.53 13.99 14.22 13.7L11.85 11.05L14.22 8.3Z" fill="currentColor"/>
                        </svg>
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
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/admin/profile">
                <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
                </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <Link href="/" className="flex items-center w-full">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
