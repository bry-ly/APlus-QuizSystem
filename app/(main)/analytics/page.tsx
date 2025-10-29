"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Download, Filter } from "lucide-react";

interface StudentResult {
  studentId: string;
  studentName: string;
  quizTitle: string;
  score: number;
  percentage: number;
  timeSpent: number;
  completedAt: string;
  status: "passed" | "failed";
}

interface QuizAnalytics {
  quizId: string;
  quizTitle: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
  highestScore: number;
  lowestScore: number;
  averageTime: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState("all");
  const [quizzes, setQuizzes] = useState<QuizAnalytics[]>([
    {
      quizId: "1",
      quizTitle: "Mathematics Basics",
      totalAttempts: 45,
      averageScore: 78,
      passRate: 82,
      highestScore: 100,
      lowestScore: 45,
      averageTime: 28,
    },
    {
      quizId: "2",
      quizTitle: "English Literature",
      totalAttempts: 38,
      averageScore: 75,
      passRate: 79,
      highestScore: 98,
      lowestScore: 52,
      averageTime: 25,
    },
    {
      quizId: "3",
      quizTitle: "Physics Fundamentals",
      totalAttempts: 32,
      averageScore: 72,
      passRate: 75,
      highestScore: 95,
      lowestScore: 48,
      averageTime: 42,
    },
  ]);
  const [studentResults, setStudentResults] = useState<StudentResult[]>([
    {
      studentId: "1",
      studentName: "John Doe",
      quizTitle: "Mathematics Basics",
      score: 85,
      percentage: 85,
      timeSpent: 28,
      completedAt: "2024-10-20",
      status: "passed",
    },
    {
      studentId: "2",
      studentName: "Jane Smith",
      quizTitle: "Mathematics Basics",
      score: 92,
      percentage: 92,
      timeSpent: 25,
      completedAt: "2024-10-20",
      status: "passed",
    },
    {
      studentId: "3",
      studentName: "Bob Johnson",
      quizTitle: "Mathematics Basics",
      score: 65,
      percentage: 65,
      timeSpent: 30,
      completedAt: "2024-10-19",
      status: "failed",
    },
  ]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          if (session.data.user.role !== "teacher") {
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

  const scoreDistribution = [
    { range: "0-20", count: 2 },
    { range: "21-40", count: 3 },
    { range: "41-60", count: 8 },
    { range: "61-80", count: 18 },
    { range: "81-100", count: 14 },
  ];

  const performanceTrend = [
    { week: "Week 1", avgScore: 72 },
    { week: "Week 2", avgScore: 74 },
    { week: "Week 3", avgScore: 76 },
    { week: "Week 4", avgScore: 78 },
  ];

  const filteredResults =
    selectedQuiz === "all"
      ? studentResults
      : studentResults.filter((r) => r.quizTitle === selectedQuiz);

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
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor student performance and quiz statistics
            </p>
          </div>
          <Button className="gap-2">
            <Download className="size-4" />
            Export Report
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.reduce((sum, q) => sum + q.totalAttempts, 0)}
              </div>
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
                  quizzes.reduce((sum, q) => sum + q.averageScore, 0) /
                    quizzes.length
                )}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Pass Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {Math.round(
                  quizzes.reduce((sum, q) => sum + q.passRate, 0) /
                    quizzes.length
                )}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizzes.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>Distribution of student scores</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>Average scores over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Performance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Performance</CardTitle>
            <CardDescription>Statistics for each quiz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.quizId}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">{quiz.quizTitle}</h3>
                    <Badge variant="outline">
                      {quiz.totalAttempts} attempts
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Avg Score</p>
                      <p className="font-semibold">{quiz.averageScore}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pass Rate</p>
                      <p className="font-semibold text-green-600">
                        {quiz.passRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Highest</p>
                      <p className="font-semibold">{quiz.highestScore}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lowest</p>
                      <p className="font-semibold">{quiz.lowestScore}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Avg Time</p>
                      <p className="font-semibold">{quiz.averageTime} min</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Results */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Student Results</CardTitle>
                <CardDescription>
                  Individual student performance
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 bg-transparent"
              >
                <Filter className="size-4" />
                Filter
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredResults.map((result, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{result.studentName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {result.quizTitle} • {result.completedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {result.percentage}%
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {result.timeSpent} min
                      </p>
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
