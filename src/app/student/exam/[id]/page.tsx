import { ExamInterface } from "@/components/exam-interface";

export default function ExamPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch exam data based on params.id
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-secondary/50">
        <ExamInterface />
    </div>
  );
}
