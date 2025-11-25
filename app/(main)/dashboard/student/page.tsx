"use client";

import { useCallback } from "react";

import Link from "next/link";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SectionCards } from "@/components/section-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Clock,
  Trophy,
  ListChecks,
  BarChart2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  timeLimit: number | null;
  course: {
    name: string;
  };
  _count: {
    questions: number;
  };
}

interface Examination {
  id: string;
  quizId: string;
  score: number | null;
  percentage: number | null;
  completedAt: string | null;
  quiz: {
    title: string;
    _count: {
      questions: number;
    };
  };
}

export default function StudentDashboard() {
  const fetchStudentData = useCallback(async () => {
    // Fetch available quizzes with cache busting
    const quizzesResponse = await fetch("/api/quizzes", {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
      },
    });

    let quizzesList: Quiz[] = [];
    if (quizzesResponse.ok) {
      const quizzesData = await quizzesResponse.json();
      quizzesList = quizzesData.data || [];
    }

    // Fetch examinations
    const examsResponse = await fetch("/api/examinations");
    let examsList: Examination[] = [];
    if (examsResponse.ok) {
      const examsData = await examsResponse.json();
      examsList = examsData.data || [];
    }

    // Calculate stats
    const completed = examsList.filter(
      (e: Examination) => e.completedAt
    ).length;
    const totalPoints = examsList.reduce(
      (sum: number, e: Examination) => sum + (e.score || 0),
      0
    );
    const avgScore =
      completed > 0
        ? examsList
            .filter((e: Examination) => e.completedAt)
            .reduce(
              (sum: number, e: Examination) => sum + (e.percentage || 0),
              0
            ) / completed
        : 0;

    return {
      quizzes: quizzesList,
      examinations: examsList,
      stats: {
        totalQuizzes: quizzesList.length,
        completedQuizzes: completed,
        averageScore: Math.round(avgScore),
        totalPoints: Math.round(totalPoints),
      },
    };
  }, []);

  const { user, data, loading } = useDashboardData({
    role: "student",
    fetchDataFn: fetchStudentData,
  });

  const stats = data?.stats || {
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalPoints: 0,
  };
  const quizzes = data?.quizzes || [];
  const examinations = data?.examinations || [];

  if (loading) {
    return (
      <DashboardLayout role="student" title="Student Dashboard">
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64 mt-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const userRole = user?.role || "student";
  const userData = user
    ? {
        name:
          user.name ||
          `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
          user.email,
        email: user.email,
        avatar: user.image,
        firstName: user.firstName,
      }
    : undefined;

  return (
    <DashboardLayout role={userRole} user={userData} title="Student Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s your learning progress and available quizzes
        </p>
      </div>

      {/* Section Cards */}
      <div className="mb-8">
        <SectionCards
          cards={[
            {
              title: "Total Quizzes",
              value: stats.totalQuizzes,
              change:
                stats.totalQuizzes > 0
                  ? (stats.completedQuizzes / stats.totalQuizzes) * 100
                  : 0,
              changeLabel: `${stats.completedQuizzes} completed`,
              description: "Available quizzes",
              trend: "up",
            },
            {
              title: "Average Score",
              value: `${stats.averageScore}%`,
              change:
                stats.averageScore >= 70
                  ? 5
                  : stats.averageScore >= 50
                  ? 0
                  : -5,
              changeLabel:
                stats.averageScore >= 70
                  ? "Excellent performance"
                  : stats.averageScore >= 50
                  ? "Good progress"
                  : "Keep practicing",
              description: "Your quiz performance",
              trend: stats.averageScore >= 70 ? "up" : "down",
            },
            {
              title: "Total Points",
              value: stats.totalPoints,
              change: stats.totalPoints > 0 ? 10 : 0,
              changeLabel: "Earned this month",
              description: "Points from completed quizzes",
              trend: "up",
            },
            {
              title: "Completion Rate",
              value: `${
                stats.totalQuizzes > 0
                  ? Math.round(
                      (stats.completedQuizzes / stats.totalQuizzes) * 100
                    )
                  : 0
              }%`,
              change:
                stats.totalQuizzes > 0
                  ? (stats.completedQuizzes / stats.totalQuizzes) * 100
                  : 0,
              changeLabel: `${stats.completedQuizzes} of ${stats.totalQuizzes} completed`,
              description: "Quiz completion progress",
              trend: "up",
            },
          ]}
          role="student"
        />
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
              {quizzes.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia>
                      <ListChecks className="size-12 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>No quizzes available</EmptyTitle>
                    <EmptyDescription>
                      There are no quizzes available at the moment. Check back
                      later!
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                quizzes.map((quiz) => {
                  const exam = examinations.find((e) => e.quizId === quiz.id);
                  const isCompleted = exam?.completedAt;
                  const score = exam?.percentage;

                  return (
                    <div
                      key={quiz.id}
                      className="group flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="font-semibold text-base">
                            {quiz.title}
                          </h3>
                          <Badge variant="outline" className="shrink-0">
                            {quiz.course.name}
                          </Badge>
                          {isCompleted &&
                            score !== null &&
                            score !== undefined && (
                              <Badge
                                variant={score >= 70 ? "default" : "secondary"}
                                className="shrink-0"
                              >
                                {score.toFixed(0)}%
                              </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1.5 cursor-help">
                                <ListChecks className="size-4" />
                                {quiz._count.questions} questions
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Total questions in this quiz</p>
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex items-center gap-1.5 cursor-help">
                                <Clock className="size-4" />
                                {quiz.timeLimit
                                  ? `${quiz.timeLimit} mins`
                                  : "No limit"}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Time limit for this quiz</p>
                            </TooltipContent>
                          </Tooltip>
                          {isCompleted && (
                            <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                              <CheckCircle2 className="size-4" />
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={
                          isCompleted
                            ? `/results/${exam.id}`
                            : `/take-quiz/${quiz.id}`
                        }
                      >
                        <Button
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                          className="ml-4 shrink-0"
                        >
                          {isCompleted ? "View Results" : "Start Quiz"}
                        </Button>
                      </Link>
                    </div>
                  );
                })
              )}
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
              {examinations.filter((e) => e.completedAt).length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia>
                      <BarChart2 className="size-10 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle className="text-sm">No results yet</EmptyTitle>
                    <EmptyDescription className="text-xs">
                      Complete quizzes to see your results here
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                examinations
                  .filter((exam) => exam.completedAt)
                  .slice(0, 5)
                  .map((exam) => (
                    <div key={exam.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium truncate pr-2">
                          {exam.quiz.title}
                        </span>
                        <Badge
                          variant={
                            exam.percentage && exam.percentage >= 70
                              ? "default"
                              : "secondary"
                          }
                          className="shrink-0"
                        >
                          {exam.percentage?.toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress value={exam.percentage || 0} className="h-2" />
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          {/* Gamification */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="size-4" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-primary/20">
                <div className="flex items-center justify-center size-10 rounded-full bg-primary/10">
                  <Trophy className="size-5 text-yellow-500 dark:text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Quiz Master</p>
                  <p className="text-xs text-muted-foreground">
                    Complete 10 quizzes
                  </p>
                  <Progress
                    value={Math.min((stats.completedQuizzes / 10) * 100, 100)}
                    className="h-1.5 mt-2"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg opacity-60">
                <div className="flex items-center justify-center size-10 rounded-full bg-muted">
                  <AlertCircle className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">Perfect Score</p>
                  <p className="text-xs text-muted-foreground">
                    Score 100% on any quiz
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart Section */}
      <div className="mb-8">
        <ChartAreaInteractive
          title="Quiz Performance"
          description="Your quiz scores over time"
          data={examinations
            .filter((exam) => exam.completedAt && exam.percentage !== null)
            .map((exam) => {
              const date = exam.completedAt
                ? typeof exam.completedAt === "string"
                  ? exam.completedAt
                  : new Date(exam.completedAt).toISOString()
                : new Date().toISOString();
              return {
                date,
                value: exam.percentage || 0,
              };
            })
            .sort(
              (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
            )}
          dataKey="value"
          label="Score (%)"
          role="student"
        />
      </div>
    </DashboardLayout>
  );
}
