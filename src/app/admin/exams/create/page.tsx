
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedQuestion, Exam } from "@/types";
import { ExamForm } from "@/components/exam-form";

export default function CreateExamPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateExam = async (examData: Omit<Exam, 'id'>, questions: GeneratedQuestion[]) => {
    if (questions.length === 0) {
      toast({
        variant: "destructive",
        title: "No Questions in Bank",
        description: "Please add at least one question to the exam's question bank.",
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

    setIsLoading(true);

    try {
      // Create a new exam document
      const examDocRef = await addDoc(collection(db, "exams"), {
        ...examData,
        createdAt: new Date(),
        status: examData.status || "Draft", // Ensure status is set
      });

      // Add questions to the question bank subcollection
      const batch = writeBatch(db);
      const questionsColRef = collection(db, "exams", examDocRef.id, "questions");

      questions.forEach((q) => {
        // Use the temporary manual ID or generate a new one
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
        title: "Exam Created",
        description: "The exam and its question bank have been saved successfully.",
      });

      router.push("/admin/exams");

    } catch (error) {
      console.error("Error creating exam:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: "An error occurred while saving the exam. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ExamForm 
      mode="create" 
      onSubmit={handleCreateExam} 
      isLoading={isLoading} 
    />
  );
}
