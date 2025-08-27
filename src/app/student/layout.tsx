import { StudentHeader } from "@/components/student-header";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <StudentHeader />
      <main className="flex-1">{children}</main>
    </div>
  );
}
