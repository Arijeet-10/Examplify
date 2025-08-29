
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, UserPlus, Users, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { AddStudentForm } from "@/components/add-student-form";
import type { Student } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

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

  const handleDeactivateStudent = async (studentId: string) => {
    try {
        const studentDocRef = doc(db, "students", studentId);
        await updateDoc(studentDocRef, { status: "Inactive" });
        toast({
            title: "Student Deactivated",
            description: "The student's status has been set to Inactive.",
        });
    } catch (error) {
        console.error("Error deactivating student:", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "An error occurred while deactivating the student.",
        });
    }
  };

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
      
       {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
             {Array.from({ length: 8 }).map((_, i) => (
                 <Card key={i}>
                    <CardHeader className="items-center">
                       <Skeleton className="h-20 w-20 rounded-full" />
                       <Skeleton className="h-6 w-3/4 mt-3" />
                       <Skeleton className="h-4 w-1/2 mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
             ))}
         </div>
       ) : students.length === 0 ? (
           <div className="flex flex-col items-center justify-center text-center min-h-[400px] border-2 border-dashed rounded-lg">
                <Users className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">No Students Added</h3>
                <p className="text-muted-foreground">Add students to begin managing them.</p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="mt-4">
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
       ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {students.map((student) => (
            <Card key={student.id} className="flex flex-col text-center">
                <CardHeader className="items-center">
                     <Avatar className="h-20 w-20">
                        <AvatarFallback className="text-2xl">{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-2 text-sm">
                    <p className="text-muted-foreground truncate">{student.email}</p>
                    <p>Student ID: <span className="font-semibold">{student.studentId}</span></p>
                    <Badge variant={student.status === "Active" ? "default" : "secondary"}>
                        {student.status}
                    </Badge>
                </CardContent>
                <CardFooter className="bg-muted/50 p-2 flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                        <Link href={`/admin/students/view/${student.id}`}>View</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                        <Link href={`/admin/students/edit/${student.id}`}>Edit</Link>
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive-outline" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will set the student's status to "Inactive". They may lose access to certain features.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeactivateStudent(student.id)} className="bg-destructive hover:bg-destructive/90">
                                Deactivate
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
