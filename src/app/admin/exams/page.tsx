
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle, FileText, Clock, Calendar } from "lucide-react";
import type { Exam } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const examsColRef = collection(db, "exams");
    const unsubscribe = onSnapshot(examsColRef, async (snapshot) => {
        const examList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title,
                status: data.status,
                date: data.date,
                duration: data.duration,
                description: data.description,
            } as Exam;
        });
        setExams(examList);
        setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteExam = async (examId: string) => {
    try {
      await deleteDoc(doc(db, "exams", examId));
      toast({
        title: "Exam Deleted",
        description: "The exam has been successfully deleted.",
      });
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: "An error occurred while deleting the exam.",
      });
    }
  };


  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Published":
        return "default";
      case "Draft":
        return "secondary";
      case "Completed":
        return "outline";
      case "Ongoing":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline">Exam Management</h2>
        <Link href="/admin/exams/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Exam
          </Button>
        </Link>
      </div>

       {isLoading ? (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
             ))}
         </div>
        ) : exams.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center min-h-[400px] border-2 border-dashed rounded-lg">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Exams Found</h3>
                <p className="text-muted-foreground">Get started by creating a new exam.</p>
                 <Link href="/admin/exams/create" className="mt-4">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Exam
                  </Button>
                </Link>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {exams.map((exam) => (
                    <Card key={exam.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="font-headline text-lg leading-tight">{exam.title}</CardTitle>
                                <Badge variant={getBadgeVariant(exam.status)} className="shrink-0">
                                    {exam.status}
                                </Badge>
                            </div>
                            <CardDescription className="line-clamp-2">{exam.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
                             <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>{exam.date}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                <span>{exam.duration} minutes</span>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/50 p-2">
                             <AlertDialog>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-full justify-start px-2">
                                        <MoreHorizontal className="h-4 w-4 mr-2" />
                                        <span>Actions</span>
                                    </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" className="w-48">
                                    <Link href={`/admin/exams/edit/${exam.id}`}>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/monitoring`}>
                                        <DropdownMenuItem>Monitor</DropdownMenuItem>
                                    </Link>
                                    <Link href={`/admin/exams/grade/${exam.id}`}>
                                        <DropdownMenuItem>Grade</DropdownMenuItem>
                                    </Link>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem className="text-destructive">
                                        Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the exam
                                        and all its related data.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteExam(exam.id)} className="bg-destructive hover:bg-destructive/90">
                                        Delete
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );
}
