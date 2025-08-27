import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Clock, HelpCircle } from "lucide-react";

const mockExams = [
  {
    id: "1",
    title: "Mid-Term Physics",
    description: "Covering chapters 1-5 on classical mechanics and thermodynamics.",
    duration: 90,
    questions: 50,
  },
  {
    id: "2",
    title: "English Literature Quiz",
    description: "A quick quiz on Shakespeare's 'Hamlet'.",
    duration: 20,
    questions: 15,
  },
    {
    id: "3",
    title: "Calculus I",
    description: "Exam on limits, derivatives, and integration.",
    duration: 120,
    questions: 40,
  },
];

export default function StudentDashboard() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline">Welcome, Student!</h1>
        <p className="text-muted-foreground">Here are your available exams. Good luck!</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockExams.map((exam) => (
          <Card key={exam.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="font-headline">{exam.title}</CardTitle>
              <CardDescription>{exam.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                <span>{exam.duration} minutes</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>{exam.questions} questions</span>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/student/exam/${exam.id}`} className="w-full">
                <Button className="w-full bg-accent hover:bg-accent/90">
                  Start Exam
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
