
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Exam, Submission } from "@/types";
import { Users, FileCheck, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface ExamMonitoringCardProps {
  exam: Exam;
}

export function ExamMonitoringCard({ exam }: ExamMonitoringCardProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const submissionsQuery = query(
      collection(db, "submissions"),
      where("examId", "==", exam.id)
    );

    const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Submission[];
      setSubmissions(subs);
      setIsLoading(false);
    }, (error) => {
        console.error(`Error fetching submissions for exam ${exam.id}:`, error);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, [exam.id]);

  const averageScore = submissions.length > 0
    ? (submissions.reduce((acc, sub) => acc + sub.score, 0) / submissions.length).toFixed(1)
    : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="font-headline text-lg">{exam.title}</CardTitle>
        <CardDescription>Status: <Badge variant="destructive">Ongoing</Badge></CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 rounded-lg bg-secondary">
             <Users className="mx-auto h-6 w-6 mb-2 text-primary" />
             <p className="text-2xl font-bold">{submissions.length}</p>
             <p className="text-xs text-muted-foreground">Submissions</p>
          </div>
           <div className="p-4 rounded-lg bg-secondary">
             <FileCheck className="mx-auto h-6 w-6 mb-2 text-primary" />
             <p className="text-2xl font-bold">{averageScore}</p>
             <p className="text-xs text-muted-foreground">Avg. Score</p>
          </div>
        </div>

        <div>
            <h4 className="font-semibold text-sm mb-2">Completed Students</h4>
            <ScrollArea className="h-40 w-full rounded-md border">
                <div className="p-4">
                {isLoading ? (
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ) : submissions.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                        {submissions.map(sub => (
                            <li key={sub.id} className="flex justify-between items-center">
                                <span>{sub.studentName}</span>
                                <span className="font-mono text-xs p-1 bg-muted rounded">{sub.score}/{sub.totalAutoGraded}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No submissions yet.</p>
                )}
                </div>
            </ScrollArea>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/admin/exams/grade/${exam.id}`}>
                View All Submissions
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
