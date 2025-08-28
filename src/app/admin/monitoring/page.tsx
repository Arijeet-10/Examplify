
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, AlertCircle } from "lucide-react";
import type { Exam } from "@/types";
import { ExamMonitoringCard } from "@/components/exam-monitoring-card";

export default function MonitoringPage() {
  const [ongoingExams, setOngoingExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const examsQuery = query(collection(db, "exams"), where("status", "==", "Ongoing"));

    const unsubscribe = onSnapshot(examsQuery, (snapshot) => {
      const examsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exam[];
      setOngoingExams(examsList);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching ongoing exams:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-6 h-6" />
            Real-time Exam Monitoring
          </CardTitle>
          <CardDescription>
            Live overview of all exams that are currently in progress.
          </CardDescription>
        </CardHeader>
      </Card>
      
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : ongoingExams.length === 0 ? (
        <Card>
           <CardContent className="flex flex-col items-center justify-center text-center min-h-[400px]">
              <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Ongoing Exams</h3>
              <p className="text-muted-foreground">
                There are no exams currently in the "Ongoing" state to monitor.
              </p>
           </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          {ongoingExams.map((exam) => (
            <ExamMonitoringCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  );
}
