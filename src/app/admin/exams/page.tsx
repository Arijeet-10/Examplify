import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, PlusCircle } from "lucide-react";

const mockExams = [
  {
    id: "EXM001",
    title: "Mid-Term Physics",
    status: "Published",
    students: 120,
    date: "2024-08-15",
  },
  {
    id: "EXM002",
    title: "Final Year Chemistry",
    status: "Draft",
    students: 0,
    date: "2024-09-01",
  },
  {
    id: "EXM003",
    title: "History Pop Quiz",
    status: "Completed",
    students: 250,
    date: "2024-07-20",
  },
   {
    id: "EXM004",
    title: "Calculus I",
    status: "Ongoing",
    students: 85,
    date: "2024-08-10",
  },
];

export default function ExamsPage() {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Published":
        return "default";
      case "Draft":
        return "secondary";
      case "Completed":
        return "outline";
      case "Ongoing":
        return "destructive"; // Using destructive variant to simulate an 'accent' color for ongoing
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-headline">Exam Management</h2>
        <Link href="/admin/exams/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Exam
          </Button>
        </Link>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Exam ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockExams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="font-medium">{exam.id}</TableCell>
                <TableCell>{exam.title}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(exam.status)}>
                    {exam.status}
                  </Badge>
                </TableCell>
                <TableCell>{exam.students}</TableCell>
                <TableCell>{exam.date}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Monitor</DropdownMenuItem>
                      <DropdownMenuItem>Grade</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
