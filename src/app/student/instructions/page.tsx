
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Wifi, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InstructionsPage() {
    const router = useRouter();

    return (
        <div className="container flex items-center justify-center min-h-screen py-12">
            <Card className="w-full max-w-3xl shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-headline">General Instructions</CardTitle>
                    <CardDescription>Please read the following instructions carefully before starting your exam.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ul className="space-y-4 text-muted-foreground">
                        <li className="flex items-start gap-4">
                            <Shield className="w-8 h-8 text-primary mt-1" />
                            <div>
                                <h4 className="font-semibold text-foreground">Academic Integrity</h4>
                                <p>Do not use any unfair means during the exam. Any malpractice will result in disqualification.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <Wifi className="w-8 h-8 text-primary mt-1" />
                            <div>
                                <h4 className="font-semibold text-foreground">Stable Connection</h4>
                                <p>Ensure you have a stable and reliable internet connection throughout the examination.</p>
                            </div>
                        </li>
                         <li className="flex items-start gap-4">
                            <Clock className="w-8 h-8 text-primary mt-1" />
                            <div>
                                <h4 className="font-semibold text-foreground">Time Limit</h4>
                                <p>The exam is timed. The timer will start as soon as you begin the exam and will submit automatically when the time is up.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <CheckCircle className="w-8 h-8 text-primary mt-1" />
                            <div>
                                <h4 className="font-semibold text-foreground">Read Carefully</h4>
                                <p>Read each question and its options carefully before answering. Once submitted, answers cannot be changed.</p>
                            </div>
                        </li>
                    </ul>
                     <div className="bg-secondary p-4 rounded-lg text-center text-sm">
                        <p>By proceeding, you agree to adhere to all the rules and regulations of this examination.</p>
                        <p className="font-bold">Good Luck!</p>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                        <Link href="/student/dashboard">
                            I Understand, Proceed to Dashboard
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
