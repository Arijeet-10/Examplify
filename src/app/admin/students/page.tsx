
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import Link from "next/link";
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
import { MoreHorizontal, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddStudentForm } from "@/components/add-student-form";
import type { Student } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";


export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

   useEffect(() => {
    const studentsColRef = collection(db, "students");
    const unsubscribe = onSnapshot(studentsColRef, (snapshot) => {
      const studentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline">Student Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Enter the details below to create a new student account.
              </DialogDescription>
            </DialogHeader>
            <AddStudentForm onFinished={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Student ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                     <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : students.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No students found.
                    </TableCell>
                </TableRow>
            ) : (
                students.map((student) => (
                <TableRow key={student.id}>
                    <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={`https://picsum.photos/seed/${student.id}/100`} data-ai-hint="person face" />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                        </div>
                    </div>
                    </TableCell>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell>
                    <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                        {student.status}
                    </Badge>
                    </TableCell>
                    <TableCell>{student.joined}</TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                         <Link href={`/admin/students/edit/${student.id}`}>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                         </Link>
                        <DropdownMenuItem className="text-destructive">
                            Deactivate
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
