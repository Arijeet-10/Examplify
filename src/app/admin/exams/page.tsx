

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";
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
    // In a real app, you might want to also delete subcollections recursively.
    // Firestore doesn't support this natively on the client, so it would
    // require a Cloud Function for a complete cleanup.
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
        return "destructive"; // Using destructive variant to simulate an 'accent' color for ongoing
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
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
               ))
            ) : exams.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                        No exams created yet.
                    </TableCell>
                </TableRow>
            ) : (
                exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(exam.status)}>
                        {exam.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{exam.date}</TableCell>
                    <TableCell>
                       <AlertDialog>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                               <Link href={`/admin/exams/edit/${exam.id}`}>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                               </Link>
                              <DropdownMenuItem>Monitor</DropdownMenuItem>
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
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the exam
                                and all its questions.
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
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    