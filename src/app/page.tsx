
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpenCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";


export default function Home() {
  const router = useRouter();
  const { toast } = useToast();

  const [studentId, setStudentId] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [adminUserId, setAdminUserId] = useState("");
  const [adminPassword, setAdminPassword] = useState("12245");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("student");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  
  const [resetAdminId, setResetAdminId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");


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
      router.push("/admin/dashboard");
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid admin credentials. Please ensure the admin user (admin@example.com) is set up in Firebase with the correct password.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (resetAdminId !== '12245') {
        toast({
            variant: "destructive",
            title: "Invalid User ID",
            description: "The entered Admin User ID is incorrect.",
        });
        setIsLoading(false);
        return;
    }

    if (!newPassword || newPassword.length < 6) {
        toast({
            variant: "destructive",
            title: "Invalid Password",
            description: "New password must be at least 6 characters.",
        });
        setIsLoading(false);
        return;
    }

    if (newPassword !== confirmNewPassword) {
        toast({
            variant: "destructive",
            title: "Passwords Do Not Match",
            description: "The new password and confirmation do not match.",
        });
        setIsLoading(false);
        return;
    }

    // In a real application, this is where you would call a secure backend
    // function to update the password in Firebase Auth.
    // For this example, we will simulate success.
    
    toast({
        title: "Password Reset (Simulated)",
        description: "Your password has been successfully updated. You can now log in with your new password.",
    });
    
    // Also update the state for the main login form if they reset it
    setAdminPassword(newPassword);

    // Reset form and close dialog
    setResetAdminId("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsResetDialogOpen(false);
    setIsLoading(false);
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
                      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                          <DialogTrigger asChild>
                              <Button type="button" variant="link" size="sm" className="p-0 h-auto">Forgot Password?</Button>
                          </DialogTrigger>
                          <DialogContent>
                              <DialogHeader>
                                  <DialogTitle>Reset Admin Password</DialogTitle>
                                  <DialogDescription>
                                    Enter your Admin User ID and a new password below.
                                  </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleDirectPasswordReset} className="space-y-4">
                                  <div className="space-y-2">
                                      <Label htmlFor="reset-admin-id">Admin User ID</Label>
                                      <Input id="reset-admin-id" placeholder="Enter your Admin User ID" required value={resetAdminId} onChange={e => setResetAdminId(e.target.value)} />
                                  </div>
                                   <div className="space-y-2">
                                      <Label htmlFor="new-password">New Password</Label>
                                      <Input id="new-password" type="password" placeholder="Enter new password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                  </div>
                                   <div className="space-y-2">
                                      <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                                      <Input id="confirm-new-password" type="password" placeholder="Confirm new password" required value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} />
                                  </div>
                                  <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? <Loader2 className="animate-spin" /> : "Set New Password"}
                                    </Button>
                                  </DialogFooter>
                              </form>
                          </DialogContent>
                      </Dialog>
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
