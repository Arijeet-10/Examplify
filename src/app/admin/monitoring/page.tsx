import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function MonitoringPage() {
  return (
    <div className="p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Real-time Exam Monitoring</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center min-h-[400px]">
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Feature Under Construction</h3>
          <p className="text-muted-foreground">
            The real-time exam monitoring interface will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
