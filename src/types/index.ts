

export type GeneratedQuestion = {
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
    questionCount: number;
};

export type Student = {
    id: string;
    name: string;
    email: string;
    studentId: string;
    status: 'Active' | 'Inactive';
    joined: string;
};
