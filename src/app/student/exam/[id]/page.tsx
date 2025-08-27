import { ExamInterface } from "@/components/exam-interface";

export default function ExamPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/50">
        <ExamInterface examId={params.id} />
    </div>
  );
}
