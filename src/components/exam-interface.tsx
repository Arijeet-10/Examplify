
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp, query, where, documentId } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "@/lib/firebase";
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
import { AlertCircle, Loader2, Wifi } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Exam, GeneratedQuestion as Question, Student } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useNetworkSpeed } from "@/hooks/use-network-speed";


export function ExamInterface({ examId }: { examId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [user, authLoading] = useAuthState(auth);
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const { speed, type } = useNetworkSpeed();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
        router.push('/');
        return;
    }

    const fetchExamData = async () => {
      setIsLoading(true);
      try {
        // First, check if the student has already submitted this exam
        const submissionQuery = query(
          collection(db, "submissions"),
          where("examId", "==", examId),
          where("studentId", "==", user.uid)
        );
        const submissionSnapshot = await getDocs(submissionQuery);

        if (!submissionSnapshot.empty) {
          throw new Error("You have already completed this exam. Please wait for the results. Good luck!");
        }

        const examDocRef = doc(db, "exams", examId);
        const examSnapshot = await getDoc(examDocRef);

        if (!examSnapshot.exists() || examSnapshot.data().status === 'Draft') {
          throw new Error("Exam not found or not available.");
        }
        
        const examData = { id: examSnapshot.id, ...examSnapshot.data() } as Exam;
        setExam(examData);
        setTimeLeft(examData.duration * 60);
        
        const questionsColRef = collection(db, "exams", examId, "questions");
        const questionsSnapshot = await getDocs(questionsColRef);
        const fetchedQuestions = questionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Question[];

        if (fetchedQuestions.length === 0) {
            throw new Error("Could not load your assigned questions.");
        }

        // Fisher-Yates shuffle algorithm
        const shuffleArray = (array: Question[]) => {
          let currentIndex = array.length, randomIndex;
          while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [
              array[randomIndex], array[currentIndex]];
          }
          return array;
        }

        setQuestions(shuffleArray(fetchedQuestions));

      } catch (err: any) {
        console.error("Error fetching exam data:", err);
        setError(err.message || "Failed to load the exam.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExamData();
  }, [examId, user, authLoading, router]);


  useEffect(() => {
    if (isLoading || isSubmitting || error) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isLoading, isSubmitting, error]);

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
  
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    let score = 0;
    let autoGradedCount = 0;

    questions.forEach(q => {
        if (q.type === 'mcq') {
            autoGradedCount++;
            if (answers[q.id] === q.answer) {
                score++;
            }
        }
    });

    try {
        if (!user) throw new Error("User not authenticated.");

        // Fetch student details
        const studentDocRef = doc(db, "students", user.uid);
        const studentSnapshot = await getDoc(studentDocRef);
        if (!studentSnapshot.exists()) {
            throw new Error("Could not find student profile.");
        }
        const studentData = studentSnapshot.data() as Student;


        const submissionData = {
            examId: examId,
            studentId: user.uid,
            studentName: studentData.name,
            studentIdentifier: studentData.studentId,
            studentEmail: studentData.email,
            submittedAt: serverTimestamp(),
            answers,
            score,
            totalAutoGraded: autoGradedCount,
            totalQuestions: questions.length,
        };

        await addDoc(collection(db, "submissions"), submissionData);

        toast({
            title: "Exam Submitted!",
            description: "Your answers have been recorded. Good luck!",
        });
        router.push("/student/dashboard?status=submitted");

    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Submission Failed",
            description: error.message || "An error occurred while submitting. Please try again.",
        });
        setIsSubmitting(false);
    }
  };

  if (isLoading || authLoading) {
    return (
        <div className="flex flex-col items-center justify-center p-4 md:p-6 min-h-[calc(100vh-4rem)]">
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
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
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
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
              <Card className="w-full max-w-md text-center p-8">
                  <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h2 className="mt-4 text-2xl font-bold">No Questions Found</h2>
                  <p className="mt-2 text-muted-foreground">This exam does not have any questions yet or none were assigned to you.</p>
                  <Button onClick={() => router.push('/student/dashboard')} className="mt-6">Go to Dashboard</Button>
              </Card>
          </div>
      )
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).filter(key => answers[key]).length;

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-6 min-h-full">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
          <CardTitle className="text-2xl font-headline text-center md:text-left">
            {exam.title}
          </CardTitle>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-sm font-semibold" title={`Connection type: ${type}`}>
                <Wifi className={`w-5 h-5 ${speed === null ? 'text-muted-foreground' : speed > 1 ? 'text-green-500' : 'text-destructive'}`} />
                <span>
                    {speed !== null ? `${speed.toFixed(1)} Mbps` : 'N/A'}
                </span>
             </div>
             <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${timeLeft < 300 ? 'bg-destructive' : 'bg-green-500'} animate-pulse`}></div>
                <span className={`font-semibold ${timeLeft < 300 ? 'text-destructive' : 'text-foreground'}`}>
                  {formatTime(timeLeft)}
                </span>
             </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Submit Exam"}
                </Button>
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
                  <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Confirm Submission"}
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
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${currentQuestion.id}-${index}`} />
                      <Label htmlFor={`${currentQuestion.id}-${index}`} className="font-normal text-base">{option}</Label>
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
