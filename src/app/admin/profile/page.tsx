
"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function AdminProfilePage() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <Card>
                <CardHeader className="items-center text-center">
                     <Skeleton className="h-24 w-24 rounded-full" />
                     <Skeleton className="h-6 w-1/2 mt-4" />
                     <Skeleton className="h-4 w-1/3 mt-2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!user) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto text-center">
        <p>You must be logged in to view this page.</p>
        <Button asChild className="mt-4">
            <Link href="/">Return to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Card>
            <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100`} data-ai-hint="person face" />
                    <AvatarFallback className="text-3xl">A</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl mt-4">Administrator</CardTitle>
                <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">You have full access to all management panels.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                    <Button asChild variant="outline">
                        <Link href="/admin/exams">
                            Manage Exams <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                    <Button asChild variant="outline">
                         <Link href="/admin/students">
                            Manage Students <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
