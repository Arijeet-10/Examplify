import { ExamInterface } from "@/components/exam-interface";

export default function ExamPage({ params }: { params: { id: string } }) {
  const examId = params.id;
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/50">
        <ExamInterface examId={examId} />
    </div>
  );
}
