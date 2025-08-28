
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Captcha } from "@/components/captcha";


export default function Home() {
  const router = useRouter();
  const { toast } = useToast();

  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [isStudentCaptchaVerified, setIsStudentCaptchaVerified] = useState(false);
  const [isAdminCaptchaVerified, setIsAdminCaptchaVerified] = useState(false);


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
      router.push("/student/instructions");

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

    try {
      await signInWithEmailAndPassword(auth, adminUserId, adminPassword);
      router.push("/admin/dashboard");
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid admin credentials. Please ensure the admin user is set up in Firebase with the correct password.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 bg-background">
       <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="absolute top-4 right-4">Admin Login</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin Login</DialogTitle>
            <DialogDescription>
              Enter your administrator credentials to access the dashboard.
            </DialogDescription>
          </DialogHeader>
           <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-user-id">Admin User ID</Label>
                <Input
                  id="admin-user-id"
                  placeholder="example@mail.com"
                  required
                  value={adminUserId}
                  onChange={e => setAdminUserId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input id="admin-password" type="password" required placeholder="••••••••" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
              </div>
                <div className="space-y-2">
                <Label>Verification</Label>
                <Captcha onVerified={setIsAdminCaptchaVerified} />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading || !isAdminCaptchaVerified}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Admin Login"}
              </Button>
            </form>
        </DialogContent>
      </Dialog>


      <div className="w-full max-w-md">
          <Card className="shadow-2xl overflow-hidden">
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center items-center gap-2 mb-2">
                 <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
                  <path d="M14.22 8.3C14.53 8.01 14.51 7.5 14.19 7.21C13.88 6.91 13.37 6.94 13.08 7.27L10.23 10.47C9.94 10.8 9.94 11.31 10.24 11.63L13.08 14.73C13.37 15.06 13.88 15.09 14.19 14.79C14.51 14.5 14.53 13.99 14.22 13.7L11.85 11.05L14.22 8.3Z" fill="currentColor"/>
                </svg>
                <h1 className="text-3xl font-bold font-headline text-primary">
                  Examplify
                </h1>
              </div>
              <CardTitle className="text-2xl font-headline">Student Portal</CardTitle>
              <CardDescription>
                Sign in to access your examination panel.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input id="student-id" placeholder="Enter your student ID" required value={studentId} onChange={e => setStudentId(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input id="student-password" type="password" placeholder="Enter your password" required value={studentPassword} onChange={e => setStudentPassword(e.target.value)} />
                  </div>
                   <div className="space-y-2">
                    <Label>Verification</Label>
                    <Captcha onVerified={setIsStudentCaptchaVerified} />
                  </div>
                  <Button type="submit" className="w-full mt-2" disabled={isLoading || !isStudentCaptchaVerified}>
                    {isLoading ? <Loader2 className="animate-spin" /> : "Student Login"}
                  </Button>
                </form>
            </CardContent>
          </Card>
      </div>
    </main>
  );
}
