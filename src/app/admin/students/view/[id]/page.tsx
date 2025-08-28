
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Camera, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";


export default function ViewStudentPage({ params: { id } }: { params: { id: string } }) {
    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsLoading(true);
        const studentDocRef = doc(db, "students", id);

        const unsubscribe = onSnapshot(studentDocRef, (doc) => {
            if (doc.exists()) {
                setStudent({ id: doc.id, ...doc.data() } as Student);
            } else {
                setError("Student not found.");
            }
            setIsLoading(false);
        }, (err) => {
            console.error("Failed to fetch student data", err);
            setError(err.message || "An unexpected error occurred.");
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [id]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // Upload file to Firebase Storage
            const storageRef = ref(storage, `profile-pictures/${id}/${file.name}`);
            const uploadResult = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(uploadResult.ref);

            // Update student document in Firestore
            const studentDocRef = doc(db, "students", id);
            await updateDoc(studentDocRef, {
                photoURL: downloadURL
            });

            toast({
                title: "Profile Picture Updated",
                description: "The new profile picture has been saved.",
            });

        } catch (err: any) {
            console.error("Error uploading file:", err);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: err.message || "An error occurred while uploading the image.",
            });
        } finally {
            setIsUploading(false);
        }
    };


    if (isLoading) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <Card>
                    <CardHeader className="items-center text-center">
                        <Skeleton className="h-32 w-32 rounded-full" />
                        <Skeleton className="h-8 w-1/2 mt-4" />
                        <Skeleton className="h-4 w-1/3 mt-2" />
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
                       <Skeleton className="h-10 w-full" />
                       <Skeleton className="h-10 w-full" />
                       <Skeleton className="h-10 w-full" />
                       <Skeleton className="h-10 w-full" />
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
    
    if (!student) {
        return null;
    }


    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
             <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                   <Link href="/admin/students">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Students
                   </Link>
                </Button>
            </div>
            <Card className="overflow-hidden">
                <CardHeader className="flex flex-col items-center bg-muted/30 p-8 text-center">
                    <div className="relative group">
                         <Avatar className="h-32 w-32">
                            <AvatarImage src={student.photoURL} alt={student.name} />
                            <AvatarFallback className="text-4xl">
                                {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute bottom-2 right-2 rounded-full h-10 w-10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleAvatarClick}
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="animate-spin" /> : <Camera className="h-5 w-5" />}
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/png, image/jpeg"
                        />
                    </div>
                    <CardTitle className="mt-4 text-3xl font-bold">{student.name}</CardTitle>
                    <CardDescription className="text-lg">{student.email}</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <h4 className="text-lg font-semibold mb-4">Student Information</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="grid gap-1.5">
                            <p className="font-medium text-muted-foreground">Student ID</p>
                            <p className="font-semibold text-lg">{student.studentId}</p>
                        </div>
                         <div className="grid gap-1.5">
                            <p className="font-medium text-muted-foreground">Status</p>
                            <p>
                               <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                                 {student.status}
                               </Badge>
                            </p>
                        </div>
                        <div className="grid gap-1.5">
                            <p className="font-medium text-muted-foreground">Date Joined</p>
                            <p>{format(new Date(student.joined), "PPP")}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-6 border-t">
                    <Button asChild variant="outline">
                        <Link href={`/admin/students/edit/${student.id}`}>
                            Edit Student
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
