
"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { doc, onSnapshot, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import type { Admin } from "@/types";

export default function AdminProfilePage() {
  const [user, loading] = useAuthState(auth);
  const [adminProfile, setAdminProfile] = useState<Admin | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
        const adminDocRef = doc(db, "admins", user.uid);

        const unsubscribe = onSnapshot(adminDocRef, async (docSnapshot) => {
            if (docSnapshot.exists()) {
                setAdminProfile(docSnapshot.data() as Admin);
                setIsProfileLoading(false);
            } else {
                // If profile doesn't exist, create one.
                try {
                    const newProfile: Admin = {
                        id: user.uid,
                        email: user.email || "",
                        name: user.displayName || "New Admin",
                        designation: "Administrator",
                        phone: "",
                    };
                    await setDoc(adminDocRef, newProfile);
                    setAdminProfile(newProfile);
                } catch (error) {
                    console.error("Error creating admin profile:", error);
                } finally {
                    setIsProfileLoading(false);
                }
            }
        });
        return () => unsubscribe();
    } else if (!loading) {
        setIsProfileLoading(false);
    }
  }, [user, loading]);

  if (loading || isProfileLoading) {
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
                 <CardFooter className="flex justify-center">
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
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
                    <AvatarFallback className="text-3xl">{adminProfile?.name?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl mt-4">{adminProfile?.name || 'Administrator'}</CardTitle>
                <CardDescription>{adminProfile?.designation || "Designation not set"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-sm">
                   <div className="grid gap-1.5">
                        <p className="font-medium text-muted-foreground">Login Email</p>
                        <p>{user.email}</p>
                    </div>
                    <div className="grid gap-1.5">
                        <p className="font-medium text-muted-foreground">Contact Email</p>
                        <p>{adminProfile?.email || "Not set"}</p>
                    </div>
                     <div className="grid gap-1.5">
                        <p className="font-medium text-muted-foreground">Phone Number</p>
                        <p>{adminProfile?.phone || "Not set"}</p>
                    </div>
                </div>
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
            <CardFooter className="flex justify-center">
                <Button asChild>
                    <Link href="/admin/profile/edit">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    </div>
  );
}
