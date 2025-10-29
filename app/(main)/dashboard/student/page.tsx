"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { Progress } from "@/components/ui/progress";
import {
  ListChecks,
  BarChart2,
  Trophy,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  subject: string;
  questions: number;
  timeLimit: number;
  status: "available" | "completed" | "in-progress";
  score?: number;
  totalScore?: number;
}

interface StudentStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  totalPoints: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StudentStats>({
    totalQuizzes: 12,
    completedQuizzes: 8,
    averageScore: 82,
    totalPoints: 450,
  });

  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: "1",
      title: "Mathematics Basics",
      subject: "Mathematics",
      questions: 20,
      timeLimit: 30,
      status: "completed",
      score: 18,
      totalScore: 20,
    },
    {
      id: "2",
      title: "English Literature",
      subject: "English",
      questions: 15,
      timeLimit: 25,
      status: "available",
    },
    {
      id: "3",
      title: "Physics Fundamentals",
      subject: "Physics",
      questions: 25,
      timeLimit: 45,
      status: "in-progress",
    },
    {
      id: "4",
      title: "Chemistry Reactions",
      subject: "Chemistry",
      questions: 20,
      timeLimit: 35,
      status: "completed",
      score: 16,
      totalScore: 20,
    },
  ]);

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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground">
            Here's your learning progress and available quizzes
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completedQuizzes} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore}%</div>
              <Progress value={stats.averageScore} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPoints}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <Trophy className="inline size-3 mr-1" />
                Earned this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  (stats.completedQuizzes / stats.totalQuizzes) * 100
                )}
                %
              </div>
              <Progress
                value={(stats.completedQuizzes / stats.totalQuizzes) * 100}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </div>

        {/* Quizzes Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Quizzes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="size-5" />
                  Available Quizzes
                </CardTitle>
                <CardDescription>
                  Take quizzes to improve your knowledge
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ListChecks className="size-4" />
                          {quiz.questions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {quiz.timeLimit} mins
                        </span>
                        {quiz.status === "completed" && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="size-4" />
                            {quiz.score}/{quiz.totalScore}
                          </span>
                        )}
                      </div>
                    </div>
                    <Link href={`/main/quizzes/${quiz.id}`}>
                      <Button
                        variant={
                          quiz.status === "completed" ? "outline" : "default"
                        }
                        size="sm"
                      >
                        {quiz.status === "completed"
                          ? "Review"
                          : quiz.status === "in-progress"
                          ? "Continue"
                          : "Start"}
                      </Button>
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Recent Results */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="size-5" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quizzes
                  .filter((q) => q.status === "completed")
                  .map((quiz) => (
                    <div key={quiz.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {quiz.title}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {quiz.score}/{quiz.totalScore}
                        </span>
                      </div>
                      <Progress
                        value={
                          ((quiz.score || 0) / (quiz.totalScore || 1)) * 100
                        }
                      />
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Gamification */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Trophy className="size-5 text-yellow-500" />
                  <div className="text-sm">
                    <p className="font-semibold">Quiz Master</p>
                    <p className="text-xs text-muted-foreground">
                      Complete 10 quizzes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg opacity-50">
                  <AlertCircle className="size-5 text-gray-400" />
                  <div className="text-sm">
                    <p className="font-semibold">Perfect Score</p>
                    <p className="text-xs text-muted-foreground">
                      Score 100% on any quiz
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
