
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowRight, Book, CheckCircle, Users } from "lucide-react";
import { Exam, Student, Submission } from "@/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell } from "recharts";
import { Button } from "@/components/ui/button";

const CHART_COLORS = ["#3B82F6", "#F97316", "#10B981", "#6B7280"]; // Blue, Orange, Green, Gray

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    exams: 0,
    submissions: 0,
  });
  const [examStatusData, setExamStatusData] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [
          studentsSnapshot,
          examsSnapshot,
          submissionsSnapshot,
          recentSubmissionsSnapshot,
        ] = await Promise.all([
          getDocs(collection(db, "students")),
          getDocs(collection(db, "exams")),
          getDocs(collection(db, "submissions")),
          getDocs(
            query(
              collection(db, "submissions"),
              orderBy("submittedAt", "desc"),
              limit(5)
            )
          ),
        ]);

        // Calculate stats
        setStats({
          students: studentsSnapshot.size,
          exams: examsSnapshot.size,
          submissions: submissionsSnapshot.size,
        });

        // Process exam statuses for chart
        const statuses = examsSnapshot.docs.reduce((acc, doc) => {
          const status = (doc.data() as Exam).status;
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(statuses).map(
          ([name, value], index) => ({
            name,
            value,
            fill: CHART_COLORS[index % CHART_COLORS.length],
          })
        );
        setExamStatusData(chartData);

        // Set recent submissions
        const submissionsList = recentSubmissionsSnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Submission)
        );
        setRecentSubmissions(submissionsList);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-6">
      <h2 className="text-3xl font-bold font-headline">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/4" />
            ) : (
              <div className="text-2xl font-bold">{stats.students}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <Book className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/4" />
            ) : (
              <div className="text-2xl font-bold">{stats.exams}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Submissions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-1/4" />
            ) : (
              <div className="text-2xl font-bold">{stats.submissions}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Submissions */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Submissions</CardTitle>
            <CardDescription>
              The latest 5 submissions from students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : recentSubmissions.length > 0 ? (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Submitted</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentSubmissions.map((sub) => (
                            <TableRow key={sub.id}>
                                <TableCell className="font-medium">{sub.studentName}</TableCell>
                                <TableCell>
                                <span className="font-semibold text-primary">{sub.score}</span> / {sub.totalAutoGraded}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                {format(new Date(sub.submittedAt.seconds * 1000), "Pp")}
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No submissions yet.
              </p>
            )}
          </CardContent>
            <CardFooter>
                 <Button asChild variant="outline" size="sm">
                    <Link href="/admin/monitoring">
                        View All Submissions
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>

        {/* Exam Status Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Exam Status Overview</CardTitle>
            <CardDescription>
              Distribution of exams by their current status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : examStatusData.length > 0 ? (
              <ChartContainer
                config={{}}
                className="mx-auto aspect-square h-48"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={examStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    strokeWidth={5}
                  >
                    {examStatusData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
                <p className="text-center text-muted-foreground py-8">
                    No exam data to display.
                </p>
            )}
          </CardContent>
           <CardFooter className="flex flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Trending up by 5.2% this month <ArrowRight className="h-4 w-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Showing total visitors for the last 6 months
                </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

