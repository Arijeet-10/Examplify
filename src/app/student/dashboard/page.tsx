
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, HelpCircle } from "lucide-react";
import type { Exam } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch exams that are 'Published' or 'Ongoing'
    const examsQuery = query(collection(db, "exams"), where("status", "in", ["Published", "Ongoing"]));

    const unsubscribe = onSnapshot(examsQuery, async (snapshot) => {
      const examListPromises = snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const questionsSnapshot = await getDocs(collection(db, "exams", doc.id, "questions"));
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          duration: data.duration,
          date: data.date,
          status: data.status,
          questionCount: questionsSnapshot.size,
        } as Exam;
      });

      const examList = await Promise.all(examListPromises);
      setExams(examList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Welcome, Student!</h1>
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
      ) : exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center min-h-[300px] border rounded-lg">
            <h3 className="text-xl font-semibold">No Exams Available</h3>
            <p className="text-muted-foreground">There are currently no published exams for you to take.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
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
                <Link href={`/student/exam/${exam.id}`} className="w-full">
                  <Button className="w-full bg-accent hover:bg-accent/90">
                    Start Exam
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
