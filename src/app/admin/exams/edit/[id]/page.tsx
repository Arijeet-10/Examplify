
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedQuestion, Exam } from "@/types";
import { ExamForm } from "@/components/exam-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";


export default function EditExamPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const [initialData, setInitialData] = useState<{exam: Exam, questions: GeneratedQuestion[]} | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const fetchExamData = async () => {
            setIsLoading(true);
            try {
                const examDocRef = doc(db, "exams", id);
                const examSnapshot = await getDoc(examDocRef);

                if (!examSnapshot.exists()) {
                    throw new Error("Exam not found.");
                }

                const examData = { id: examSnapshot.id, ...examSnapshot.data() } as Exam;

                const questionsColRef = collection(db, "exams", id, "questions");
                const questionsSnapshot = await getDocs(questionsColRef);
                const questions = questionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as GeneratedQuestion[];

                setInitialData({ exam: examData, questions });
            } catch (err: any) {
                console.error("Failed to fetch exam data", err);
                setError(err.message || "An unexpected error occurred.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchExamData();
    }, [id]);


    const handleUpdateExam = async (examData: Omit<Exam, 'id'>, questions: GeneratedQuestion[]) => {
        if (questions.length === 0) {
            toast({
                variant: "destructive",
                title: "No Questions",
                description: "An exam must have at least one question in its bank.",
            });
            return;
        }

        if (!examData.assignedStudentIds || examData.assignedStudentIds.length === 0) {
          toast({
            variant: "destructive",
            title: "No Students Assigned",
            description: "Please assign at least one student to the exam.",
          });
          return;
        }

        setIsSubmitting(true);

        try {
            const examDocRef = doc(db, "exams", id);
            
            // Update the main exam document
            await updateDoc(examDocRef, {
                ...examData,
                updatedAt: new Date(),
            });

            // We'll overwrite the questions in the question bank.
            const batch = writeBatch(db);
            const questionsColRef = collection(db, "exams", id, "questions");

            // First, delete old questions 
            const oldQuestionsSnapshot = await getDocs(questionsColRef);
            oldQuestionsSnapshot.forEach(doc => batch.delete(doc.ref));

            // Then, add the new/updated list of questions
            questions.forEach((q) => {
                // Use the existing ID, or let Firestore generate one for new questions
                const questionDocRef = q.id.startsWith('manual-') ? doc(questionsColRef) : doc(questionsColRef, q.id);
                batch.set(questionDocRef, {
                    question: q.question,
                    answer: q.answer,
                    type: q.type,
                    ...(q.type === 'mcq' && { options: q.options })
                });
            });

            await batch.commit();

            toast({
                title: "Exam Updated",
                description: "The exam has been successfully updated.",
            });

            router.push("/admin/exams");

        } catch (error) {
            console.error("Error updating exam:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "An error occurred while saving the exam.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (isLoading) {
        return (
            <div className="p-8 space-y-8">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-48 w-full" />
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
        <ExamForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleUpdateExam}
            isLoading={isSubmitting}
        />
    );
}
