
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";
import type { Submission, Exam } from "@/types";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GradingPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [exam, setExam] = useState<Exam | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGradingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch exam details
        const examDocRef = doc(db, "exams", id);
        const examSnapshot = await getDoc(examDocRef);
        if (!examSnapshot.exists()) {
          throw new Error("Exam not found.");
        }
        setExam({ id: examSnapshot.id, ...examSnapshot.data() } as Exam);

        // Fetch submissions for this exam
        const submissionsQuery = query(collection(db, "submissions"), where("examId", "==", id));
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissionsList = submissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Submission[];
        
        setSubmissions(submissionsList);

      } catch (err: any) {
        console.error("Error fetching grading data:", err);
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGradingData();
    }
  }, [id]);

  return (
    <div className="p-4 md:p-8">
        <div className="mb-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/exams">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Exams
                </Link>
            </Button>
        </div>

      <Card>
        <CardHeader>
          {isLoading && !exam ? (
             <>
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-1/2 mt-2" />
             </>
          ) : (
            <>
              <CardTitle>Submissions for: {exam?.title}</CardTitle>
              <CardDescription>
                Review student scores and submissions for this exam. 
                Only auto-graded MCQ scores are shown.
              </CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent>
            {error && <p className="text-destructive text-center">{error}</p>}
           <div className="border rounded-lg">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                        <TableCell colSpan={4}>
                            <Skeleton className="h-10 w-full" />
                        </TableCell>
                        </TableRow>
                    ))
                    ) : submissions.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                            <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                            No submissions found for this exam yet.
                        </TableCell>
                    </TableRow>
                    ) : (
                    submissions.map((submission) => (
                        <TableRow key={submission.id}>
                        <TableCell className="font-medium">{submission.studentName}</TableCell>
                        <TableCell>
                            <span className="font-semibold text-primary">{submission.score}</span>
                             / {submission.totalAutoGraded}
                        </TableCell>
                        <TableCell>
                            {format(new Date(submission.submittedAt.seconds * 1000), "PPP p")}
                        </TableCell>
                        <TableCell>
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/submissions/${submission.id}`}>
                                 View Details
                                </Link>
                            </Button>
                        </TableCell>
                        </TableRow>
                    ))
                    )}
                </TableBody>
                </Table>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
