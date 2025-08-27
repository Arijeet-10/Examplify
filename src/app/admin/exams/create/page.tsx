import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuestionGenerator } from "@/components/question-generator";
import { Button } from "@/components/ui/button";

export default function CreateExamPage() {
  return (
    <div className="p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
          <CardDescription>
            Provide the basic information for the new exam.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Exam Title</Label>
            <Input id="exam-title" placeholder="e.g., Final Year Chemistry Exam" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-description">Description</Label>
            <Textarea
              id="exam-description"
              placeholder="A brief description of the exam."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-duration">Duration (in minutes)</Label>
              <Input id="exam-duration" type="number" placeholder="e.g., 90" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="exam-date">Exam Date</Label>
              <Input id="exam-date" type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      <QuestionGenerator />

      <div className="flex justify-end gap-2">
        <Button variant="outline">Save as Draft</Button>
        <Button className="bg-accent hover:bg-accent/90">Create Exam</Button>
      </div>
    </div>
  );
}
