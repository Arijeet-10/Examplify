
"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft, Check, X } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Submission, Exam, GeneratedQuestion, QuestionWithStudentAnswer } from "@/types";

export default function SubmissionDetailsPage({ params: { id } }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<QuestionWithStudentAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!id) throw new Error("Submission ID is missing.");

        // 1. Fetch the submission document
        const submissionDocRef = doc(db, "submissions", id);
        const submissionSnapshot = await getDoc(submissionDocRef);
        if (!submissionSnapshot.exists()) {
          throw new Error("Submission not found.");
        }
        const submissionData = { id: submissionSnapshot.id, ...submissionSnapshot.data() } as Submission;
        setSubmission(submissionData);

        // 2. Fetch the corresponding exam details
        const examDocRef = doc(db, "exams", submissionData.examId);
        const examSnapshot = await getDoc(examDocRef);
        if (!examSnapshot.exists()) {
          throw new Error("Associated exam not found.");
        }
        const examData = { id: examSnapshot.id, ...examSnapshot.data() } as Exam;
        setExam(examData);

        // 3. Fetch all questions for that exam
        const questionsColRef = collection(db, "exams", submissionData.examId, "questions");
        const questionsSnapshot = await getDocs(questionsColRef);
        const examQuestions = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GeneratedQuestion[];

        // 4. Combine questions with student's answers
        const combinedQuestions: QuestionWithStudentAnswer[] = examQuestions.map(q => ({
          ...q,
          studentAnswer: submissionData.answers[q.id] || "No answer",
        }));
        setQuestions(combinedQuestions);

      } catch (err: any) {
        console.error("Error fetching submission details:", err);
        setError(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const renderResultIcon = (question: QuestionWithStudentAnswer) => {
    if (question.type !== 'mcq') {
      return null;
    }
    const isCorrect = question.studentAnswer === question.answer;
    return isCorrect ? (
      <Check className="h-5 w-5 text-green-600" />
    ) : (
      <X className="h-5 w-5 text-destructive" />
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
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
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/exams/grade/${exam?.id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Submissions
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
          <CardDescription>Reviewing submission for exam: <strong>{exam?.title}</strong></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold">Student Name</p>
              <p className="text-muted-foreground">{submission?.studentName}</p>
            </div>
            <div>
              <p className="font-semibold">Submitted On</p>
              <p className="text-muted-foreground">
                {submission && format(new Date(submission.submittedAt.seconds * 1000), "PPP p")}
              </p>
            </div>
            <div>
              <p className="font-semibold">Auto-Graded Score</p>
              <p className="text-muted-foreground">
                <span className="text-lg font-bold text-primary">{submission?.score}</span> / {submission?.totalAutoGraded}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card key={q.id}>
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <p className="font-semibold">Question {index + 1}</p>
                <p>{q.question}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={q.type === 'mcq' ? 'default' : 'secondary'}>{q.type}</Badge>
                {renderResultIcon(q)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="bg-secondary/50 p-4 rounded-md">
                 <p className="text-sm font-semibold">Student's Answer:</p>
                 <p className="text-muted-foreground">{q.studentAnswer}</p>
               </div>
               <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-md">
                 <p className="text-sm font-semibold text-green-800 dark:text-green-300">Correct Answer:</p>
                 <p className="text-green-700 dark:text-green-400">{q.answer}</p>
               </div>
                {q.type === 'mcq' && q.options && (
                    <div className="pt-2">
                        <p className="text-xs text-muted-foreground">Options were:</p>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                            {q.options.map((opt, i) => <li key={i}>{opt}</li>)}
                        </ul>
                    </div>
                )}
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
