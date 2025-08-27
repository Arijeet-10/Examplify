"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle } from "lucide-react";

type Question = {
  id: number;
  type: "mcq" | "descriptive";
  question: string;
  options?: string[];
};

const mockQuestions: Question[] = [
  {
    id: 1,
    type: "mcq",
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
  },
  {
    id: 2,
    type: "descriptive",
    question: "Explain the theory of relativity in your own words.",
  },
  {
    id: 3,
    type: "mcq",
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Saturn"],
  },
  {
    id: 4,
    type: "mcq",
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
  },
  {
    id: 5,
    type: "descriptive",
    question: "Describe the water cycle.",
  },
];

const EXAM_DURATION = 15 * 60; // 15 minutes in seconds

export function ExamInterface() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);

  useEffect(() => {
    if (timeLeft <= 0) {
      // Auto-submit logic
      router.push("/student/dashboard?status=submitted");
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, router]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mockQuestions.length) * 100;

  const handleSubmit = () => {
    // In a real app, you would send answers to the server here.
    console.log("Submitting answers:", answers);
    router.push("/student/dashboard?status=submitted");
  };

  const answeredCount = Object.keys(answers).filter(key => answers[parseInt(key)]).length;

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 min-h-full">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-headline">
            Mid-Term Examination
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
                    You have answered {answeredCount} out of {mockQuestions.length} questions. You cannot change your answers after submission.
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
            <div className="p-6 border rounded-lg bg-secondary/50">
              <p className="text-lg font-semibold mb-4">
                Question {currentQuestion.id}: {currentQuestion.question}
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
            {currentQuestionIndex + 1} / {mockQuestions.length}
          </div>
          <Button
            onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
            disabled={currentQuestionIndex === mockQuestions.length - 1}
          >
            Next
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
