
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/types";
import { EditStudentForm } from "@/components/edit-student-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditStudentPage({ params: { id } }: { params: { id: string } }) {
    const [student, setStudent] = useState<Student | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const fetchStudentData = async () => {
            setIsLoading(true);
            try {
                const studentDocRef = doc(db, "students", id);
                const studentSnapshot = await getDoc(studentDocRef);

                if (!studentSnapshot.exists()) {
                    throw new Error("Student not found.");
                }

                setStudent({ id: studentSnapshot.id, ...studentSnapshot.data() } as Student);

            } catch (err: any) {
                console.error("Failed to fetch student data", err);
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchStudentData();
        }
    }, [id]);

    const handleUpdateStudent = async (data: { name: string; studentId: string; status: "Active" | "Inactive" }) => {
        setIsSubmitting(true);
        try {
            const studentDocRef = doc(db, "students", id);
            await updateDoc(studentDocRef, data);

            toast({
                title: "Student Updated",
                description: "The student's details have been successfully updated.",
            });
            router.push("/admin/students");
        } catch (error) {
            console.error("Error updating student:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "An error occurred while saving the student details.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/2" />
                        <Skeleton className="h-4 w-3/4 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-8">
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
            <div className="mb-6">
                <Button asChild variant="outline" size="sm">
                   <Link href="/admin/students">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Students
                   </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Edit Student Details</CardTitle>
                    <CardDescription>Update the student's information below.</CardDescription>
                </CardHeader>
                <CardContent>
                    {student && (
                        <EditStudentForm
                            student={student}
                            onUpdate={handleUpdateStudent}
                            isLoading={isSubmitting}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
