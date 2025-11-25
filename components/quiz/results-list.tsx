"use client";

import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Examination } from "@/hooks/use-results";

interface ResultsListProps {
  results: Examination[];
  onDelete: (id: string) => void;
}

export function ResultsList({ results, onDelete }: ResultsListProps) {
  const router = useRouter();

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Results</CardTitle>
        <CardDescription>View detailed results for each quiz</CardDescription>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No quizzes taken yet.
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{result.quiz.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {result.completedAt
                        ? `Completed: ${format(
                            new Date(result.completedAt),
                            "PPP"
                          )}`
                        : "In Progress"}
                    </span>
                    {result.timeSpent && (
                      <span>Time: {Math.floor(result.timeSpent / 60)} min</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {result.completedAt && (
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {result.percentage}%
                      </div>
                      <Badge
                        className={
                          result.passed
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        }
                      >
                        {result.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/results/${result.id}`)}
                    >
                      {result.completedAt ? "View Details" : "Continue Quiz"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(result.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
