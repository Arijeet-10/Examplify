
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedQuestion, Exam, Student } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Wand, X, Users, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";

function ManualQuestionCreator({ onQuestionAdded }: { onQuestionAdded: (question: GeneratedQuestion) => void }) {
    const [questionType, setQuestionType] = useState<'mcq' | 'descriptive'>('mcq');
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [answer, setAnswer] = useState('');
    const { toast } = useToast();
    const [manualId, setManualId] = useState('');

     useEffect(() => {
        // Generate the ID on the client side to avoid hydration mismatch
        setManualId(`manual-${Date.now()}-${Math.random()}`);
    }, []);

    const handleAddOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        } else {
             toast({
                variant: "destructive",
                title: "Option Limit Reached",
                description: "You can add a maximum of 5 options.",
            });
        }
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            const newOptions = options.filter((_, i) => i !== index);
            setOptions(newOptions);
        } else {
             toast({
                variant: "destructive",
                title: "Minimum Options",
                description: "You need at least 2 options for an MCQ.",
            });
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleAddQuestion = () => {
        if (!question.trim()) {
            toast({ variant: "destructive", title: "Missing Question", description: "Please enter the question text." });
            return;
        }

        if (questionType === 'mcq') {
            if (options.some(opt => !opt.trim()) || !answer.trim()) {
                 toast({ variant: "destructive", title: "Incomplete MCQ", description: "Please fill all options and select a correct answer." });
                return;
            }
             if (!options.includes(answer)) {
                toast({ variant: "destructive", title: "Invalid Answer", description: "The selected answer must be one of the options." });
                return;
            }
            onQuestionAdded({ question, type: 'mcq', options, answer, id: manualId });
        } else {
            if (!answer.trim()) {
                toast({ variant: "destructive", title: "Missing Answer", description: "Please provide an answer for the descriptive question." });
                return;
            }
            onQuestionAdded({ question, type: 'descriptive', answer, id: manualId });
        }

        // Reset form and generate new ID for the next question
        setQuestion('');
        setOptions(['', '']);
        setAnswer('');
        setManualId(`manual-${Date.now()}-${Math.random()}`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Wand className="w-5 h-5"/>Add Questions to Bank</CardTitle>
                <CardDescription>Create questions that will be available for this exam.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label>Question Type</Label>
                    <Tabs defaultValue="mcq" onValueChange={(value) => setQuestionType(value as 'mcq' | 'descriptive')} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="mcq">Multiple Choice</TabsTrigger>
                            <TabsTrigger value="descriptive">Descriptive</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="manual-question">Question</Label>
                    <Textarea id="manual-question" placeholder="e.g., What is the capital of India?" value={question} onChange={e => setQuestion(e.target.value)} />
                </div>
                
                {questionType === 'mcq' ? (
                     <div className="space-y-4 rounded-md border p-4">
                        <Label>Options & Correct Answer</Label>
                        <RadioGroup onValueChange={setAnswer} value={answer} className="space-y-2">
                            {options.map((option, index) => (
                                <div key={index} className="flex items-center gap-2">
                                     <RadioGroupItem value={option} id={`option-${index}`} />
                                     <Input 
                                        type="text" 
                                        placeholder={`Option ${index + 1}`} 
                                        value={option} 
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                    />
                                    <Button variant="ghost" size="icon" type="button" onClick={() => handleRemoveOption(index)}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </RadioGroup>
                        <Button variant="outline" size="sm" type="button" onClick={handleAddOption}><Plus className="mr-2 h-4 w-4" /> Add Option</Button>
                    </div>
                ) : (
                     <div className="space-y-2">
                        <Label htmlFor="descriptive-answer">Answer</Label>
                        <Textarea id="descriptive-answer" placeholder="Enter the correct answer or grading guideline" value={answer} onChange={e => setAnswer(e.target.value)} />
                    </div>
                )}

                <Button type="button" onClick={handleAddQuestion}><Plus className="mr-2 h-4 w-4" /> Add Question to Bank</Button>
            </CardContent>
        </Card>
    );
}

function AssignStudents({ 
    allStudents,
    selectedStudents, 
    onSelectionChange,
}: { 
    allStudents: Student[],
    selectedStudents: string[], 
    onSelectionChange: (ids: string[]) => void,
}) {
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      if (allStudents.length > 0) setIsLoading(false);
    }, [allStudents]);


    const handleSelectAll = (checked: boolean) => {
        onSelectionChange(checked ? allStudents.map(s => s.id) : []);
    };

    const handleStudentSelect = (studentId: string, checked: boolean) => {
        if (checked) {
            onSelectionChange([...selectedStudents, studentId]);
        } else {
            onSelectionChange(selectedStudents.filter(id => id !== studentId));
        }
    };

    const areAllSelected = allStudents.length > 0 && selectedStudents.length === allStudents.length;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/>Assign Students</CardTitle>
                <CardDescription>Select which students will be able to take this exam.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="animate-spin text-primary"/>
                    </div>
                ) : allStudents.length === 0 ? (
                    <p className="text-muted-foreground text-center">No active students found. Add students before creating an exam.</p>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                           <Checkbox
                                id="select-all"
                                checked={areAllSelected}
                                onCheckedChange={handleSelectAll}
                            />
                            <Label htmlFor="select-all" className="font-bold">Select All Students</Label>
                        </div>
                        <ScrollArea className="h-60 w-full rounded-md border">
                           <div className="p-4 space-y-2">
                                {allStudents.map(student => (
                                    <div key={student.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={student.id}
                                            checked={selectedStudents.includes(student.id)}
                                            onCheckedChange={(checked) => handleStudentSelect(student.id, !!checked)}
                                        />
                                        <Label htmlFor={student.id} className="font-normal flex-1">
                                            {student.name} <span className="text-muted-foreground">({student.studentId})</span>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ExamFormProps {
    mode: 'create' | 'edit';
    initialData?: { exam: Exam, questions: GeneratedQuestion[] } | null;
    onSubmit: (examData: Omit<Exam, 'id'>, questions: GeneratedQuestion[]) => Promise<void>;
    isLoading: boolean;
}

export function ExamForm({ mode, initialData, onSubmit, isLoading }: ExamFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<Exam['status']>('Draft');
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
  const [assignedStudentIds, setAssignedStudentIds] = useState<string[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);

  const router = useRouter();
  const { toast } = useToast();
  
  useEffect(() => {
        const fetchStudents = async () => {
            const studentsQuery = query(collection(db, "students"), where("status", "==", "Active"));
            const snapshot = await getDocs(studentsQuery);
            const studentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
            setAllStudents(studentList);
        };
        fetchStudents();
    }, []);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
        setTitle(initialData.exam.title);
        setDescription(initialData.exam.description);
        setDuration(String(initialData.exam.duration));
        setDate(initialData.exam.date);
        setStatus(initialData.exam.status);
        setQuestions(initialData.questions);
        setAssignedStudentIds(initialData.exam.assignedStudentIds || []);
    }
  }, [mode, initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!title || !description || !duration || !date) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all exam details.",
      });
      return;
    }
    
    const examData = { title, description, duration: Number(duration), date, status, assignedStudentIds };
    onSubmit(examData, questions);
  }

  const addQuestionToExam = (newQuestion: GeneratedQuestion) => {
    setQuestions(prev => [...prev, newQuestion]);
     toast({
        title: "Question Added",
        description: "The question has been added to the question bank.",
    });
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Create New Exam' : 'Edit Exam'}</CardTitle>
          <CardDescription>
            {mode === 'create' ? 'Provide the basic information for the new exam.' : 'Update the details for this exam.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam-title">Exam Title</Label>
            <Input id="exam-title" placeholder="e.g., Final Year Chemistry Exam" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-description">Description</Label>
            <Textarea
              id="exam-description"
              placeholder="A brief description of the exam."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exam-duration">Duration (in minutes)</Label>
              <Input id="exam-duration" type="number" placeholder="e.g., 90" value={duration} onChange={(e) => setDuration(e.target.value)} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="exam-date">Exam Date</Label>
              <Input id="exam-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="exam-status">Status</Label>
                <Select onValueChange={(value) => setStatus(value as Exam['status'])} value={status}>
                    <SelectTrigger id="exam-status">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Published">Published</SelectItem>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <ManualQuestionCreator onQuestionAdded={addQuestionToExam} />

      {questions.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Question Bank ({questions.length})</CardTitle>
                  <CardDescription>This is the central pool of questions for this exam.</CardDescription>
              </CardHeader>
              <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                      {questions.map((q, index) => (
                           <AccordionItem key={q.id} value={`item-${index}`}>
                                <div className="flex items-center justify-between pr-4">
                                  <AccordionTrigger className="text-left flex-1">{`Question ${index + 1}: ${q.question}`}</AccordionTrigger>
                                   <Button variant="ghost" size="icon" type="button" onClick={() => removeQuestion(q.id)}>
                                        <X className="w-4 h-4 text-destructive" />
                                   </Button>
                                </div>
                                <AccordionContent className="bg-secondary/50 p-4 rounded-md space-y-2">
                                     <p className="text-xs uppercase font-semibold text-muted-foreground">{q.type}</p>
                                     {q.type === 'mcq' ? (
                                        <div>
                                            <p><strong>Correct Answer:</strong> {q.answer}</p>
                                            <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                                                {q.options?.map((opt, i) => <li key={i}>{opt}</li>)}
                                            </ul>
                                        </div>
                                     ) : (
                                        <p><strong>Answer:</strong> {q.answer}</p>
                                     )}
                                </AccordionContent>
                           </AccordionItem>
                      ))}
                  </Accordion>
              </CardContent>
          </Card>
      )}
      
      <AssignStudents 
        allStudents={allStudents}
        selectedStudents={assignedStudentIds} 
        onSelectionChange={setAssignedStudentIds}
      />
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/exams')}>Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90">
            {isLoading ? (mode === 'create' ? "Creating..." : "Saving...") : (mode === 'create' ? "Create Exam" : "Save Changes")}
        </Button>
      </div>
    </form>
  );
}
