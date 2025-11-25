import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Examination } from "@/hooks/use-results";

interface ResultsStatsProps {
  results: Examination[];
  averageScore: number;
  completedResults: Examination[];
}

export function ResultsStats({
  results,
  averageScore,
  completedResults,
}: ResultsStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Quizzes Taken
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{results.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Average Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageScore}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Passed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {completedResults.filter((r) => r.passed).length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {completedResults.filter((r) => !r.passed).length}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
