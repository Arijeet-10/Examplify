
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuestionGenerator } from "@/components/question-generator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedQuestion } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CreateExamPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState("");
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateExam = async () => {
    if (!title || !description || !duration || !date || questions.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all exam details and add at least one question.",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a new exam document
      const examDocRef = await addDoc(collection(db, "exams"), {
        title,
        description,
        duration: Number(duration),
        date,
        createdAt: new Date(),
        status: "Draft",
      });

      // Add questions to a subcollection
      const batch = writeBatch(db);
      const questionsColRef = collection(db, "exams", examDocRef.id, "questions");

      questions.forEach((q) => {
        const questionDocRef = doc(questionsColRef);
        batch.set(questionDocRef, {
          question: q.question,
          answer: q.answer,
        });
      });

      await batch.commit();

      toast({
        title: "Exam Created",
        description: "The exam and its questions have been saved successfully.",
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

  const addQuestionsToExam = (newQuestions: GeneratedQuestion[]) => {
    setQuestions(prev => [...prev, ...newQuestions]);
    toast({
        title: `${newQuestions.length} Questions Added`,
        description: "The generated questions have been added to the current exam draft.",
    });
  }

  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>
            Provide the basic information for the new exam.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Exam Title</Label>
            <Input id="exam-title" placeholder="e.g., Final Year Chemistry Exam" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-description">Description</Label>
            <Textarea
              id="exam-description"
              placeholder="A brief description of the exam."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-duration">Duration (in minutes)</Label>
              <Input id="exam-duration" type="number" placeholder="e.g., 90" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
             <div className="space-y-2">
              <Label htmlFor="exam-date">Exam Date</Label>
              <Input id="exam-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <QuestionGenerator onQuestionsGenerated={addQuestionsToExam} />

      {questions.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Exam Questions</CardTitle>
                  <CardDescription>The following questions will be added to the exam.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                      {questions.map((q, index) => (
                           <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left">{`Question ${index + 1}: ${q.question}`}</AccordionTrigger>
                                <AccordionContent className="bg-secondary/50 p-4 rounded-md">
                                    <strong>Answer:</strong> {q.answer}
                                </AccordionContent>
                           </AccordionItem>
                      ))}
                  </Accordion>
              </CardContent>
          </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.push('/admin/exams')}>Cancel</Button>
        <Button onClick={handleCreateExam} disabled={isLoading} className="bg-accent hover:bg-accent/90">
            {isLoading ? "Creating..." : "Create Exam"}
        </Button>
      </div>
    </div>
  );
}
