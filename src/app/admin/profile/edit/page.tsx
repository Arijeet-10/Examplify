
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useToast } from "@/hooks/use-toast";
import type { Admin } from "@/types";
import { EditAdminForm } from "@/components/edit-admin-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditAdminProfilePage() {
    const [user, authLoading] = useAuthState(auth);
    const [profile, setProfile] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const profileDocRef = doc(db, "admins", user.uid);
                const profileSnapshot = await getDoc(profileDocRef);

                if (profileSnapshot.exists()) {
                    setProfile({ id: profileSnapshot.id, ...profileSnapshot.data() } as Admin);
                } else {
                    // Pre-fill with some defaults if no profile exists yet
                    setProfile({
                        id: user.uid,
                        email: user.email || "",
                        name: user.displayName || "",
                        designation: "",
                        phone: ""
                    });
                }
            } catch (err: any) {
                console.error("Failed to fetch admin profile data", err);
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };
        
        if (!authLoading) {
            fetchProfileData();
        }

    }, [user, authLoading]);

    const handleUpdateProfile = async (data: Omit<Admin, 'id'>) => {
        if (!user) {
            toast({ variant: "destructive", title: "Not Authenticated" });
            return;
        }

        setIsSubmitting(true);
        try {
            const profileDocRef = doc(db, "admins", user.uid);
            
            // Using set with merge to create or update the document
            await setDoc(profileDocRef, data, { merge: true });

            toast({
                title: "Profile Updated",
                description: "Your details have been successfully updated.",
            });
            router.push("/admin/profile");
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: error.message || "An error occurred while saving your details.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || authLoading) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-8 mt-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full mt-4" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <div className="mb-6 flex justify-between items-center">
                <Button asChild variant="outline" size="sm">
                   <Link href="/admin/profile">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Profile
                   </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Your Profile</CardTitle>
                    <CardDescription>Update your personal information below.</CardDescription>
                </CardHeader>
                <CardContent>
                    {profile && (
                        <EditAdminForm
                            profile={profile}
                            onUpdate={handleUpdateProfile}
                            isLoading={isSubmitting}
                            loginEmail={user?.email || ""}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
