"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/landing/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface QuizResult {
  id: string;
  quizTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  status: "passed" | "failed";
  answers: {
    questionId: string;
    questionText: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    points: number;
  }[];
}

export default function ResultsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<QuizResult[]>([
    {
      id: "1",
      quizTitle: "Mathematics Basics",
      score: 85,
      totalPoints: 100,
      percentage: 85,
      timeSpent: 28,
      completedAt: "2024-10-20",
      status: "passed",
      answers: [
        {
          questionId: "1",
          questionText: "What is 2 + 2?",
          userAnswer: "4",
          correctAnswer: "4",
          isCorrect: true,
          points: 5,
        },
        {
          questionId: "2",
          questionText: "What is 5 × 6?",
          userAnswer: "30",
          correctAnswer: "30",
          isCorrect: true,
          points: 5,
        },
      ],
    },
    {
      id: "2",
      quizTitle: "English Literature",
      score: 72,
      totalPoints: 100,
      percentage: 72,
      timeSpent: 22,
      completedAt: "2024-10-18",
      status: "passed",
      answers: [],
    },
    {
      id: "3",
      quizTitle: "Physics Fundamentals",
      score: 55,
      totalPoints: 100,
      percentage: 55,
      timeSpent: 40,
      completedAt: "2024-10-15",
      status: "failed",
      answers: [],
    },
  ]);
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          if (session.data.user.role !== "student") {
            router.push("/");
          }
          setUser(session.data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const chartData = results.map((r) => ({
    name: r.quizTitle.substring(0, 10),
    score: r.percentage,
    fullName: r.quizTitle,
  }));

  const passFailData = [
    {
      name: "Passed",
      value: results.filter((r) => r.status === "passed").length,
    },
    {
      name: "Failed",
      value: results.filter((r) => r.status === "failed").length,
    },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {selectedResult ? (
          <>
            {/* Detail View */}
            <div className="mb-8">
              <Button
                variant="ghost"
                className="gap-2 mb-4"
                onClick={() => setSelectedResult(null)}
              >
                <ArrowLeft className="size-4" />
                Back to Results
              </Button>
              <h1 className="text-3xl font-bold mb-2">
                {selectedResult.quizTitle}
              </h1>
              <p className="text-muted-foreground">
                Completed on {selectedResult.completedAt}
              </p>
            </div>

            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Your Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {selectedResult.percentage}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedResult.score}/{selectedResult.totalPoints} points
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge
                    className={
                      selectedResult.status === "passed"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                    }
                  >
                    {selectedResult.status === "passed" ? "Passed" : "Failed"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Time Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedResult.timeSpent} min
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Correct Answers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {selectedResult.answers.filter((a) => a.isCorrect).length}/
                    {selectedResult.answers.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Answer Review */}
            <Card>
              <CardHeader>
                <CardTitle>Answer Review</CardTitle>
                <CardDescription>
                  Review your answers and correct solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedResult.answers.map((answer, idx) => (
                  <div
                    key={idx}
                    className={`p-4 border rounded-lg ${
                      answer.isCorrect
                        ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                        : "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">Question {idx + 1}</h4>
                      <Badge
                        className={
                          answer.isCorrect
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                        }
                      >
                        {answer.isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>
                    <p className="mb-3 font-medium">{answer.questionText}</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Your answer:{" "}
                        </span>
                        <span
                          className={
                            answer.isCorrect
                              ? "text-green-700 dark:text-green-400"
                              : "text-red-700 dark:text-red-400"
                          }
                        >
                          {answer.userAnswer}
                        </span>
                      </div>
                      {!answer.isCorrect && (
                        <div>
                          <span className="text-muted-foreground">
                            Correct answer:{" "}
                          </span>
                          <span className="text-green-700 dark:text-green-400">
                            {answer.correctAnswer}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Points: </span>
                        <span className="font-medium">{answer.points}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Overview */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">My Results</h1>
              <p className="text-muted-foreground">
                Track your quiz performance and progress
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Quizzes
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
                  <div className="text-2xl font-bold">
                    {Math.round(
                      results.reduce((sum, r) => sum + r.percentage, 0) /
                        results.length
                    )}
                    %
                  </div>
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
                    {results.filter((r) => r.status === "passed").length}
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
                    {results.filter((r) => r.status === "failed").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Score Trends</CardTitle>
                  <CardDescription>
                    Your performance across quizzes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="score" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pass/Fail Distribution</CardTitle>
                  <CardDescription>Quiz completion status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={passFailData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {passFailData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Results List */}
            <Card>
              <CardHeader>
                <CardTitle>All Results</CardTitle>
                <CardDescription>
                  View detailed results for each quiz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {result.quizTitle}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Completed: {result.completedAt}</span>
                          <span>Time: {result.timeSpent} min</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold">
                            {result.percentage}%
                          </div>
                          <Badge
                            className={
                              result.status === "passed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                            }
                          >
                            {result.status === "passed" ? "Passed" : "Failed"}
                          </Badge>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedResult(result)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
