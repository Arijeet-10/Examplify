
export type GeneratedQuestion = {
    id: string; // Can be from Firestore or a temporary client-side ID
    question: string;
    answer: string;
    type: 'mcq' | 'descriptive';
    options?: string[];
};

export type Exam = {
    id: string;
    title: string;
    description: string;
    duration: number;
    date: string;
    status: 'Draft' | 'Published' | 'Ongoing' | 'Completed';
    questionCount?: number; // Make optional as it's not always present on the doc itself
};

export type Student = {
    id: string;
    name: string;
    email: string;
    studentId: string;
    status: 'Active' | 'Inactive';
    joined: string;
};
