

export type GeneratedQuestion = {
    question: string;
    answer: string;
    type: 'mcq' | 'descriptive';
    options?: string[];
};
