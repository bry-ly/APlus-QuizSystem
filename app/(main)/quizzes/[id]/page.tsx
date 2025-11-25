"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
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
import {
  Play,
  Edit2,
  Eye,
  Clock,
  ListChecks,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { ShimmeringText } from "@/components/ui/shimmer";
import { useState as useReactState } from "react";

interface Quiz {
  id: string;
  title: string;
  description: string;
  subject: string;
  totalQuestions: number;
  timeLimit: number;
  passingScore: number;
  createdAt: string;
  status: "draft" | "published";
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  totalScore: number;
  completedAt: string;
  status: "completed";
}

export default function QuizDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [accessCode, setAccessCode] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user);
          // Check if this is a teacher preview (from the URL or user role)
          const urlParams = new URLSearchParams(window.location.search);
          setIsPreview(
            urlParams.get("preview") === "true" ||
              (session.data.user as any).role === "teacher"
          );
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

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId || !user) return;

      try {
        setLoading(true);

        // Fetch quiz from API
        const response = await fetch(`/api/quizzes/${quizId}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            setQuiz(null);
            return;
          }
          if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            console.error(
              "Access denied:",
              errorData.error || "You don't have permission to view this quiz"
            );
            setQuiz(null);
            return;
          }
          throw new Error("Failed to fetch quiz");
        }

        const data = await response.json();

        if (data.success && data.data) {
          const quizData = data.data;

          // Transform API response to match component interface
          const transformedQuiz: Quiz = {
            id: quizData.id,
            title: quizData.title,
            description: quizData.description || "",
            subject: quizData.course?.name || "General",
            totalQuestions: quizData.questions?.length || 0,
            timeLimit: quizData.timeLimit || 0,
            passingScore: quizData.passingScore || 50,
            createdAt: quizData.createdAt,
            status: quizData.isActive ? "published" : "draft",
            questions: (quizData.questions || []).map((q: any) => ({
              id: q.id,
              question: q.text,
              options: q.options || [],
              correctAnswer:
                q.type === "multiple-choice" ? parseInt(q.correctAnswer) : 0,
            })),
          };

          setQuiz(transformedQuiz);
          // Store the actual accessCode
          setAccessCode(
            quizData.accessCode || quizData.id.substring(0, 8).toUpperCase()
          );
          console.log(
            "Quiz loaded:",
            transformedQuiz.title,
            "with",
            transformedQuiz.totalQuestions,
            "questions"
          );
          console.log("Access code:", quizData.accessCode);

          // Fetch attempt data for students
          if (user.role === "student") {
            try {
              const examsResponse = await fetch(
                `/api/examinations?quizId=${quizId}`,
                {
                  cache: "no-store",
                }
              );

              if (examsResponse.ok) {
                const examsData = await examsResponse.json();
                const studentExam = examsData.data?.find(
                  (exam: any) => exam.quizId === quizId && exam.completedAt
                );

                if (studentExam) {
                  const transformedAttempt: QuizAttempt = {
                    id: studentExam.id,
                    quizId: studentExam.quizId,
                    score: studentExam.score || 0,
                    totalScore: transformedQuiz.totalQuestions,
                    completedAt: studentExam.completedAt,
                    status: "completed",
                  };
                  setAttempt(transformedAttempt);
                }
              }
            } catch (err) {
              console.error("Error fetching attempt data:", err);
            }
          }
        } else {
          setQuiz(null);
        }
      } catch (error) {
        console.error("Error fetching quiz:", error);
        setQuiz(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId, user]);

  const handleStartQuiz = () => {
    router.push(`/take-quiz/${quizId}`);
  };

  const handleReviewQuiz = () => {
    router.push(`/quizzes/${quizId}/review`);
  };

  const copyCodeToClipboard = () => {
    if (!quiz || !accessCode) return;
    navigator.clipboard.writeText(accessCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

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

  if (loading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" role={userRole} />
        <SidebarInset>
          <SiteHeader title="Quiz Details" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="max-w-4xl mx-auto w-full px-4">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading quiz...</p>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!quiz) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" role={userRole} user={userData} />
        <SidebarInset>
          <SiteHeader title="Quiz Details" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="max-w-4xl mx-auto w-full px-4">
                  <div className="text-center">
                    <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">Quiz Not Found</h1>
                    <p className="text-muted-foreground mb-4">
                      The quiz you&apos;re looking for doesn&apos;t exist or has
                      been removed.
                    </p>
                    <Link href="/quizzes">
                      <Button>Back to Quizzes</Button>
                    </Link>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";
  const hasCompleted = attempt?.status === "completed";

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" role={userRole} user={userData} />
      <SidebarInset>
        <SiteHeader title="Quiz Details" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-4xl mx-auto w-full px-4">
                {/* Header */}
                <div className="mb-6">
                  <Link href="/quizzes">
                    <Button variant="ghost" className="mb-4 gap-2">
                      <ArrowLeft className="size-4" />
                      Back to Quizzes
                    </Button>
                  </Link>

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{quiz.title}</h1>
                        <Badge
                          variant={
                            quiz.status === "published"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {quiz.status === "published" ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-lg mb-4">
                        {quiz.description}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ListChecks className="size-4" />
                          {quiz.totalQuestions} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-4" />
                          {quiz.timeLimit} minutes
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="size-4" />
                          {quiz.passingScore}% to pass
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {isTeacher && (
                        <>
                          <Button variant="outline" className="gap-2">
                            <Eye className="size-4" />
                            Preview
                          </Button>
                          <Link href={`/quizzes/${quiz.id}/edit`}>
                            <Button className="gap-2">
                              <Edit2 className="size-4" />
                              Edit
                            </Button>
                          </Link>
                        </>
                      )}

                      {isStudent && (
                        <Button
                          onClick={
                            hasCompleted ? handleReviewQuiz : handleStartQuiz
                          }
                          className="gap-2"
                        >
                          {hasCompleted ? (
                            <>
                              <RotateCcw className="size-4" />
                              Review Quiz
                            </>
                          ) : (
                            <>
                              <Play className="size-4" />
                              Start Quiz
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quiz Access Code for Teachers */}
                {isTeacher && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Quiz Access Code</CardTitle>
                      <CardDescription>
                        Share this code with students to give them access to the
                        quiz
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between bg-muted/50 rounded-lg p-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Access Code
                          </p>
                          <div className="text-3xl font-bold tracking-wider">
                            <ShimmeringText
                              text={
                                accessCode ||
                                quiz.id.substring(0, 8).toUpperCase()
                              }
                              duration={2}
                              wave={true}
                              className="text-primary"
                              id="access-code-display"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={copyCodeToClipboard}
                          variant="outline"
                          className="gap-2"
                        >
                          {copiedCode ? (
                            <>
                              <CheckCircle2 className="size-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="size-4" />
                              Copy Code
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quiz Stats for Students */}
                {isStudent && attempt && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Your Previous Attempt</CardTitle>
                      <CardDescription>
                        Completed on {formatDate(attempt.completedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {attempt.score}/{attempt.totalScore}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Your Score
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {Math.round(
                              (attempt.score / attempt.totalScore) * 100
                            )}
                            %
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Percentage
                          </p>
                        </div>
                        <div className="text-center">
                          <div
                            className={`text-2xl font-bold ${
                              (attempt.score / attempt.totalScore) * 100 >=
                              quiz.passingScore
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {(attempt.score / attempt.totalScore) * 100 >=
                            quiz.passingScore
                              ? "Passed"
                              : "Failed"}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress
                          value={(attempt.score / attempt.totalScore) * 100}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quiz Preview/Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Quiz Information */}
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Quiz Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Subject
                            </p>
                            <p className="font-semibold">{quiz.subject}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Questions
                            </p>
                            <p className="font-semibold">
                              {quiz.totalQuestions}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Time Limit
                            </p>
                            <p className="font-semibold">
                              {quiz.timeLimit} minutes
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              Passing Score
                            </p>
                            <p className="font-semibold">
                              {quiz.passingScore}%
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Created
                          </p>
                          <p className="font-semibold">
                            {formatDate(quiz.createdAt)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {isTeacher && (
                          <>
                            <Button className="w-full gap-2" variant="outline">
                              <Eye className="size-4" />
                              Preview Quiz
                            </Button>
                            <Link href={`/quizzes/${quiz.id}/edit`}>
                              <Button className="w-full gap-2">
                                <Edit2 className="size-4" />
                                Edit Quiz
                              </Button>
                            </Link>
                          </>
                        )}

                        {isStudent && (
                          <>
                            <Button
                              className="w-full gap-2"
                              onClick={
                                hasCompleted
                                  ? handleReviewQuiz
                                  : handleStartQuiz
                              }
                            >
                              {hasCompleted ? (
                                <>
                                  <RotateCcw className="size-4" />
                                  Review Quiz
                                </>
                              ) : (
                                <>
                                  <Play className="size-4" />
                                  Start Quiz
                                </>
                              )}
                            </Button>

                            {hasCompleted && (
                              <Link href={`/quizzes/result/${attempt.id}`}>
                                <Button
                                  className="w-full gap-2"
                                  variant="outline"
                                >
                                  <CheckCircle2 className="size-4" />
                                  View Results
                                </Button>
                              </Link>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
