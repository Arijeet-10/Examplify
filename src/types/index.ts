

export type GeneratedQuestion = {
    id: string; // Can be from Firestore or a temporary client-side ID
    question: string;
    answer: string;
    type: 'mcq' | 'descriptive';
    options?: string[];
};

export type Exam = {
    id:string;
    title: string;
    description: string;
    duration: number;
    date: string;
    status: 'Draft' | 'Published' | 'Ongoing' | 'Completed';
    questionCount?: number; // Make optional as it's not always present on the doc itself
    examId?: string; // for submissions
    submissions?: Submission[];
    assignedStudentIds?: string[]; // Array of student UIDs
    studentQuestionAssignments?: Record<string, string[]>; // Map of studentId to array of questionIds
};

export type Student = {
    id: string;
    name: string;
    email: string;
    studentId: string;
    status: 'Active' | 'Inactive';
    joined: string;
    photoURL?: string;
    phone?: string;
};

export type Admin = {
    id: string;
    name: string;
    email?: string;
    designation: string;
    phone: string;
    photoURL?: string;
};

export type Submission = {
    id: string;
    examId: string;
    studentId: string;
    studentName: string;
    submittedAt: {
        seconds: number;
        nanoseconds: number;
    };
    answers: { [key: string]: string };
    score: number;
    totalAutoGraded: number;
    totalQuestions: number;
};

export type QuestionWithStudentAnswer = GeneratedQuestion & {
    studentAnswer: string;
};

