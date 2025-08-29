
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, query, where, onSnapshot, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, HelpCircle, CheckCircle } from "lucide-react";
import type { Exam, Submission, Student } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const [user] = useAuthState(auth);
  const [studentName, setStudentName] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<Map<string, Submission>>(new Map()); // map of examId to submission
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    
    const fetchStudentData = async () => {
        const studentDocRef = doc(db, "students", user.uid);
        const studentDoc = await getDoc(studentDocRef);
        if (studentDoc.exists()) {
            setStudentName((studentDoc.data() as Student).name);
        }
    };
    fetchStudentData();

    // Fetch submitted exam IDs to determine which exams are completed
    const submissionsQuery = query(collection(db, "submissions"), where("studentId", "==", user.uid));
    const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
        const submittedExamsMap = new Map<string, Submission>();
        snapshot.docs.forEach(doc => {
            const submission = doc.data() as Submission;
            submittedExamsMap.set(submission.examId, submission);
        });
        setSubmissions(submittedExamsMap);
    });

    // Fetch exams that are 'Published' or 'Ongoing' AND assigned to the student
    const examsQuery = query(
      collection(db, "exams"), 
      where("status", "in", ["Published", "Ongoing"]),
      where("assignedStudentIds", "array-contains", user.uid)
    );
    const unsubscribeExams = onSnapshot(examsQuery, async (snapshot) => {
      const examListPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        // Fetch all questions for the exam to get the full count
        const questionsSnapshot = await getDocs(collection(db, "exams", doc.id, "questions"));
        
        return {
          id: doc.id,
          ...data,
          questionCount: questionsSnapshot.size,
        } as Exam;
      });

      const examList = await Promise.all(examListPromises);
      setExams(examList);
      setIsLoading(false);
    });

    // Clean up listeners
    return () => {
      unsubscribeSubmissions();
      unsubscribeExams();
    };
  }, [user]);

  const visibleExams = exams.filter(exam => {
    const submission = submissions.get(exam.id);

    if (submission) {
      // If submitted, check if it was within the last 24 hours
      const submissionTime = new Date(submission.submittedAt.seconds * 1000);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return submissionTime > twentyFourHoursAgo;
    }

    // If not submitted, show if it's 'Published' or 'Ongoing'
    return exam.status === 'Published' || exam.status === 'Ongoing';
  });

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Welcome, {studentName || 'Student'}!</h1>
        <p className="text-muted-foreground">Here are your available exams. Good luck!</p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
      ) : visibleExams.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center min-h-[400px] border-2 border-dashed rounded-lg p-8 bg-muted/50">
            <Image 
                src="https://picsum.photos/seed/exams-done/600/400" 
                alt="No exams available"
                width={600}
                height={400}
                className="max-w-sm rounded-lg mb-6 object-cover"
                data-ai-hint="abstract illustration"
            />
            <h3 className="text-xl font-semibold">No New Exams Available</h3>
            <p className="text-muted-foreground">There are currently no exams for you to take. Check back later!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleExams.map((exam) => {
            const hasTaken = submissions.has(exam.id);
            return (
                <Card key={exam.id} className="flex flex-col">
                <CardHeader>
                    <CardTitle className="font-headline">{exam.title}</CardTitle>
                    <CardDescription>{exam.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>{exam.duration} minutes</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>{exam.questionCount || 0} questions</span>
                    </div>
                </CardContent>
                <CardFooter>
                    {hasTaken ? (
                        <Button disabled className="w-full">
                           <CheckCircle className="mr-2 h-4 w-4" />
                           Completed
                        </Button>
                    ) : (
                        <Link href={`/student/exam/${exam.id}`} className="w-full">
                            <Button className="w-full bg-accent hover:bg-accent/90">
                                Start Exam
                            </Button>
                        </Link>
                    )}
                </CardFooter>
                </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}

    
