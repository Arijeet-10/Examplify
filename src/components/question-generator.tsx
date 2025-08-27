
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { UploadCloud, FileText, Bot, AlertCircle } from "lucide-react";
import { generateExamQuestions } from "@/ai/flows/generate-exam-questions";
import type { GenerateExamQuestionsOutput } from "@/ai/flows/generate-exam-questions";
import type { GeneratedQuestion } from "@/types";


interface QuestionGeneratorProps {
    onQuestionsGenerated: (questions: GeneratedQuestion[]) => void;
}


export function QuestionGenerator({ onQuestionsGenerated }: QuestionGeneratorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<GenerateExamQuestionsOutput["questions"]>([]);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setGeneratedQuestions([]);
    }
  };

  const handleGenerate = async () => {
    if (!file) {
      toast({
        variant: "destructive",
        title: "No Syllabus File",
        description: "Please upload a syllabus file to generate questions.",
      });
      return;
    }
    if (numQuestions <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Number",
        description: "Please enter a positive number of questions.",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedQuestions([]);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const syllabusDataUri = reader.result as string;

      try {
        const result = await generateExamQuestions({
          syllabus: { syllabusDataUri },
          numberOfQuestions: numQuestions,
        });
        setGeneratedQuestions(result.questions);
      } catch (error) {
        console.error("Error generating questions:", error);
        toast({
          variant: "destructive",
          title: "Generation Failed",
          description: "An error occurred while generating questions. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
        console.error("Error reading file:", error);
        toast({
            variant: "destructive",
            title: "File Read Error",
            description: "Could not read the uploaded file.",
        });
        setIsLoading(false);
    }
  };
  
  const handleAddQuestions = () => {
    const questionsWithTypes = generatedQuestions.map(q => ({ ...q, type: 'descriptive' as const }));
    onQuestionsGenerated(questionsWithTypes);
    setGeneratedQuestions([]); // Clear after adding
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-6 h-6" />
          <span>AI Question Generator</span>
        </CardTitle>
        <CardDescription>
          Upload a syllabus document and let AI generate exam questions for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="syllabus-file">Syllabus File</Label>
              <div className="relative">
                <Input id="syllabus-file" type="file" onChange={handleFileChange} className="pr-20" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {file ? <FileText className="w-5 h-5 text-gray-400" /> : <UploadCloud className="w-5 h-5 text-gray-400" />}
                </div>
              </div>
               {file && <p className="text-sm text-muted-foreground">Selected: {file.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="num-questions">Number of Questions</Label>
              <Input
                id="num-questions"
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
                min="1"
                placeholder="e.g., 5"
              />
            </div>
        </div>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? "Generating..." : "Generate Questions"}
        </Button>

        {isLoading && (
          <div className="space-y-2 mt-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}

        {!isLoading && generatedQuestions.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 font-headline">Generated Questions</h3>
            <Accordion type="single" collapsible className="w-full">
              {generatedQuestions.map((q, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{`Question ${index + 1}: ${q.question}`}</AccordionTrigger>
                  <AccordionContent className="bg-secondary/50 p-4 rounded-md">
                    <strong>Answer:</strong> {q.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {!isLoading && generatedQuestions.length === 0 && !file && (
          <Alert className="mt-4">
            <UploadCloud className="h-4 w-4" />
            <AlertTitle>Ready to Generate</AlertTitle>
            <AlertDescription>
              Upload your syllabus file and specify the number of questions to begin.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      {generatedQuestions.length > 0 && 
        <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleAddQuestions}>Add Questions to Exam</Button>
        </CardFooter>
      }
    </Card>
  );
}
