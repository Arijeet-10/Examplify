
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Exam, GeneratedQuestion as Question } from "@/types";


const EXAM_DURATION = 15 * 60; // 15 minutes in seconds

export function ExamInterface({ examId }: { examId: string }) {
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);

  useEffect(() => {
    const fetchExamData = async () => {
      setIsLoading(true);
      try {
        // Fetch exam details
        const examDocRef = doc(db, "exams", examId);
        const examSnapshot = await getDoc(examDocRef);

        if (!examSnapshot.exists()) {
          throw new Error("Exam not found.");
        }
        
        const examData = examSnapshot.data() as Omit<Exam, 'id'>;
        setExam({ id: examSnapshot.id, ...examData });
        setTimeLeft(examData.duration * 60);

        // Fetch questions
        const questionsColRef = collection(db, "exams", examId, "questions");
        const questionsSnapshot = await getDocs(questionsColRef);
        const fetchedQuestions = questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Question[];

        setQuestions(fetchedQuestions);

      } catch (err: any) {
        console.error("Error fetching exam data:", err);
        setError(err.message || "Failed to load the exam.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);


  useEffect(() => {
    if (isLoading) return;

    if (timeLeft <= 0) {
      // Auto-submit logic
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isLoading, router]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };
  
  const handleSubmit = () => {
    // In a real app, you would send answers to the server here.
    console.log("Submitting answers:", answers);
    router.push("/student/dashboard?status=submitted");
  };

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-6 min-h-full">
            <Card className="w-full max-w-4xl shadow-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-4 w-full" />
                    <div className="p-6 border rounded-lg bg-secondary/50 space-y-4">
                        <Skeleton className="h-6 w-full mb-4" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-1/2" />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    );
  }

  if (error) {
      return (
          <div className="flex items-center justify-center min-h-full">
              <Card className="w-full max-w-md text-center p-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                  <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
                  <p className="mt-2 text-muted-foreground">{error}</p>
                  <Button onClick={() => router.push('/student/dashboard')} className="mt-6">Go to Dashboard</Button>
              </Card>
          </div>
      )
  }

  if (!exam || questions.length === 0) {
      return <div>No questions found for this exam.</div>
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).filter(key => answers[key]).length;

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 min-h-full">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-headline">
            {exam.title}
          </CardTitle>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${timeLeft < 300 ? 'bg-destructive' : 'bg-green-500'} animate-pulse`}></div>
                <span className={`font-semibold ${timeLeft < 300 ? 'text-destructive' : 'text-foreground'}`}>
                  {formatTime(timeLeft)}
                </span>
             </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Submit Exam</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You have answered {answeredCount} out of {questions.length} questions. You cannot change your answers after submission.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    Confirm Submission
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
            <Progress value={progress} className="w-full" />
            <div className="p-6 border rounded-lg bg-secondary/50 min-h-[250px]">
              <p className="text-lg font-semibold mb-4">
                Question {currentQuestionIndex + 1}: {currentQuestion.question}
              </p>
              {currentQuestion.type === "mcq" && currentQuestion.options && (
                <RadioGroup
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestion.id, value)
                  }
                  value={answers[currentQuestion.id] || ""}
                  className="space-y-2"
                >
                  {currentQuestion.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${currentQuestion.id}-${option}`} />
                      <Label htmlFor={`${currentQuestion.id}-${option}`} className="font-normal text-base">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
              {currentQuestion.type === "descriptive" && (
                <Textarea
                  placeholder="Type your answer here..."
                  className="min-h-[150px] text-base"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion.id, e.target.value)
                  }
                />
              )}
            </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
