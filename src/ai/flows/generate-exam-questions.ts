'use server';

/**
 * @fileOverview Exam question generation flow from syllabus content.
 *
 * - generateExamQuestions - A function that generates exam questions from a syllabus.
 * - GenerateExamQuestionsInput - The input type for the generateExamQuestions function.
 * - GenerateExamQuestionsOutput - The return type for the generateExamQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SyllabusSchema = z.object({
  syllabusDataUri: z
    .string()
    .describe(
      "Syllabus document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});

const GenerateExamQuestionsInputSchema = z.object({
  syllabus: SyllabusSchema.describe('The syllabus to generate questions from.'),
  numberOfQuestions: z.number().describe('The number of questions to generate.'),
});
export type GenerateExamQuestionsInput = z.infer<typeof GenerateExamQuestionsInputSchema>;

const ExamQuestionSchema = z.object({
  question: z.string().describe('The exam question.'),
  answer: z.string().describe('The answer to the exam question.'),
});

const GenerateExamQuestionsOutputSchema = z.object({
  questions: z.array(ExamQuestionSchema).describe('The generated exam questions.'),
});
export type GenerateExamQuestionsOutput = z.infer<typeof GenerateExamQuestionsOutputSchema>;

export async function generateExamQuestions(
  input: GenerateExamQuestionsInput
): Promise<GenerateExamQuestionsOutput> {
  return generateExamQuestionsFlow(input);
}

const extractSyllabusContent = ai.defineTool({
  name: 'extractSyllabusContent',
  description: 'Extracts the text content from a syllabus file.',
  inputSchema: SyllabusSchema,
  outputSchema: z.string(),
},
async (input) => {
  // Placeholder implementation: return the data URI content directly after removing mime type etc.
  const dataUri = input.syllabusDataUri;
  return dataUri.substring(dataUri.indexOf(',') + 1);
});

const generateExamQuestionsPrompt = ai.definePrompt({
  name: 'generateExamQuestionsPrompt',
  input: {schema: GenerateExamQuestionsInputSchema},
  output: {schema: GenerateExamQuestionsOutputSchema},
  tools: [extractSyllabusContent],
  prompt: `You are an expert in generating exam questions based on syllabus content.

  The syllabus has been provided as a data URI. Use the extractSyllabusContent tool to get the text from the syllabus.
  Generate {{{numberOfQuestions}}} questions based on the syllabus content. Provide both the question and the answer for each question.
  Syllabus: {{syllabus}}`,
});

const generateExamQuestionsFlow = ai.defineFlow(
  {
    name: 'generateExamQuestionsFlow',
    inputSchema: GenerateExamQuestionsInputSchema,
    outputSchema: GenerateExamQuestionsOutputSchema,
  },
  async input => {
    const {output} = await generateExamQuestionsPrompt(input);
    return output!;
  }
);
