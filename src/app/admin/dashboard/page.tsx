import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, Clock } from "lucide-react";

const stats = [
    { title: 'Total Students', value: '1,250', icon: Users, change: '+12.5%' },
    { title: 'Active Exams', value: '15', icon: FileText, change: '+2' },
    { title: 'Submissions Today', value: '320', icon: CheckCircle, change: '+8.2%' },
    { title: 'Pending Gradings', value: '42', icon: Clock, change: '-5' }
]

export default function AdminDashboard() {
  return (
    <div className="p-4 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
            <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.change} from last month</p>
                </CardContent>
            </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Recent Exam Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Activity feed will be displayed here.</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Student Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
                 <p className="text-muted-foreground">Performance charts will be displayed here.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
