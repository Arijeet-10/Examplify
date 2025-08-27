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
import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Tabs defaultValue="student" className="w-full">
          <Card className="shadow-2xl">
            <CardHeader className="text-center">
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
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-id">Student ID</Label>
                    <Input id="student-id" placeholder="Enter your student ID" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input id="student-password" type="password" placeholder="Enter your password" required />
                  </div>
                  <Link href="/student/dashboard" className="w-full">
                    <Button className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                      Student Login
                    </Button>
                  </Link>
                </form>
              </TabsContent>
              <TabsContent value="admin">
                <form className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input id="admin-password" type="password" required placeholder="••••••••" />
                  </div>
                   <Link href="/admin/dashboard" className="w-full">
                    <Button className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                      Admin Login
                    </Button>
                  </Link>
                </form>
              </TabsContent>
            </CardContent>
            <CardFooter className="flex-col items-center gap-4">
                <Separator />
                 <div className="text-sm">
                  Don't have an account?{" "}
                  <Link href="/signup" className="font-semibold text-primary underline">
                    Sign up
                  </Link>
                </div>
            </CardFooter>
          </Card>
        </Tabs>
      </div>
    </main>
  );
}
