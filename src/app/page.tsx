
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenCheck, Loader2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const router = useRouter();
  const { toast } = useToast();

  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student");

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Find the student document by studentId
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("studentId", "==", studentId));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Student ID not found.");
      }

      // 2. Get the student's email from the document
      const studentDoc = querySnapshot.docs[0];
      const studentEmail = studentDoc.data().email;

      if (!studentEmail) {
        throw new Error("Email not found for this student.");
      }

      // 3. Sign in with email and password
      await signInWithEmailAndPassword(auth, studentEmail, studentPassword);
      router.push("/student/dashboard");

    } catch (error: any) {
      console.error("Student login error:", error);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.code === 'auth/invalid-credential' 
            ? "Invalid credentials. Please try again."
            : error.message || "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (adminUserId !== '12245' || adminPassword !== '12245') {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid Admin User ID or Password.",
        });
        setIsLoading(false);
        return;
    }

    try {
      await signInWithEmailAndPassword(auth, 'admin@example.com', adminPassword);
      router.push("/admin/exams");
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid admin credentials. Please ensure the admin user is set up in Firebase.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!adminUserId) {
      toast({
        variant: "destructive",
        title: "User ID Required",
        description: "Please enter your Admin User ID to reset the password.",
      });
      return;
    }

    if (adminUserId !== '12245') {
        toast({
            variant: "destructive",
            title: "Invalid User ID",
            description: "The entered Admin User ID is incorrect.",
        });
        return;
    }

    setIsLoading(true);
    try {
        await sendPasswordResetEmail(auth, 'admin@example.com');
        toast({
            title: "Password Reset Email Sent",
            description: "Please check the admin@example.com inbox to reset your password.",
        });
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Reset Failed",
            description: error.message || "An error occurred. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Tabs defaultValue="student" onValueChange={setActiveTab} className="w-full">
          <Card className="shadow-2xl overflow-hidden">
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center items-center gap-2 mb-2">
                <BookOpenCheck className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline text-primary">
                  Examplify
                </h1>
              </div>
              <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to access your examination panel.
              </CardDescription>
              <TabsList className="grid w-full grid-cols-2 mt-4">
                <TabsTrigger value="student">Student</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input id="student-id" placeholder="Enter your student ID" required value={studentId} onChange={e => setStudentId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input id="student-password" type="password" placeholder="Enter your password" required value={studentPassword} onChange={e => setStudentPassword(e.target.value)} />
                  </div>
                  <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading && activeTab === 'student'}>
                    {isLoading && activeTab === 'student' ? <Loader2 className="animate-spin" /> : "Student Login"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-user-id">Admin User ID</Label>
                    <Input
                      id="admin-user-id"
                      placeholder="e.g., 12245"
                      required
                      value={adminUserId}
                      onChange={e => setAdminUserId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input id="admin-password" type="password" required placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                  </div>
                  <div className="flex items-center justify-end">
                      <Button type="button" variant="link" size="sm" onClick={handlePasswordReset} className="p-0 h-auto">Forgot Password?</Button>
                  </div>
                  <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading && activeTab === 'admin'}>
                    {isLoading && activeTab === 'admin' ? <Loader2 className="animate-spin" /> : "Admin Login"}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </main>
  );
}
