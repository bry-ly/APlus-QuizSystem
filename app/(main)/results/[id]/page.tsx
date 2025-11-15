"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Award, Home, Download } from "lucide-react";
import Link from "next/link";

interface Answer {
  id: string;
  questionId: string;
  answer: string;
  isCorrect: boolean | null;
  pointsEarned: number;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface Examination {
  id: string;
  score: number | null;
  percentage: number | null;
  passed: boolean | null;
  timeSpent: number | null;
  completedAt: string | null;
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    showResults: boolean;
    questions: Question[];
  };
  answers: Answer[];
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const examinationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [examination, setExamination] = useState<Examination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push("/login");
          return;
        }

        setUser(session.data.user);

        const response = await fetch(`/api/examinations/${examinationId}`);
        if (!response.ok) {
          throw new Error("Failed to load results");
        }

        const data = await response.json();
        setExamination(data.data);
      } catch (err: any) {
        console.error("Error fetching results:", err);
        setError(err.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [examinationId, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDownloadPDF = async () => {
    if (!examination) return;

    setDownloading(true);
    try {
      const response = await fetch(`/api/results/${examinationId}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to generate PDF");
      }

      const htmlContent = await response.text();
      const blob = new Blob([htmlContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `quiz-result-${examination.quiz.title.replace(/\s+/g, "-")}-${examinationId}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Open in new window for printing
      const printWindow = window.open();
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        // Wait a bit then trigger print dialog
        setTimeout(() => {
          printWindow.print();
        }, 250);
      }
    } catch (err: any) {
      console.error("Error downloading PDF:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const userRole = user?.role || "student"
  const userData = user ? {
    name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    email: user.email,
    avatar: user.image,
    firstName: user.firstName,
  } : undefined

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
        <AppSidebar variant="inset" role="student" />
        <SidebarInset>
          <SiteHeader title="Quiz Results" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="max-w-4xl mx-auto w-full px-4">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading results...</p>
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

  if (error || !examination) {
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
          <SiteHeader title="Quiz Results" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="max-w-3xl mx-auto w-full px-4">
                  <Card className="border-destructive">
                    <CardHeader>
                      <CardTitle className="text-destructive">Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{error || "Results not found"}</p>
                      <Link href={user?.role === "student" ? "/dashboard/student" : user?.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"}>
                        <Button className="mt-4">Back to Dashboard</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  const maxScore = examination.quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const correctCount = examination.answers.filter((a) => a.isCorrect).length;

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
        <SiteHeader title="Quiz Results" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-4xl mx-auto w-full px-4">
        {/* Results Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            {examination.passed ? (
              <CheckCircle2 className="size-20 text-green-600 mx-auto" />
            ) : (
              <XCircle className="size-20 text-red-600 mx-auto" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {examination.passed ? "Congratulations! 🎉" : "Quiz Completed"}
          </h1>
          <p className="text-muted-foreground">{examination.quiz.title}</p>
        </div>

        {/* Score Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {examination.score?.toFixed(1)} / {maxScore}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Percentage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${examination.passed ? "text-green-600" : "text-red-600"}`}>
                {examination.percentage?.toFixed(1)}%
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
                {correctCount} / {examination.quiz.questions.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Time Taken
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Clock className="size-5" />
                {examination.timeSpent ? formatTime(examination.timeSpent) : "N/A"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pass/Fail Status */}
        <Card className={`mb-8 ${examination.passed ? "border-green-500" : "border-red-500"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {examination.passed ? (
                  <Award className="size-8 text-green-600" />
                ) : (
                  <XCircle className="size-8 text-red-600" />
                )}
                <div>
                  <h3 className="text-lg font-semibold">
                    {examination.passed ? "Passed!" : "Not Passed"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Passing score: {examination.quiz.passingScore}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        {examination.quiz.showResults && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
              <CardDescription>
                See how you performed on each question
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {examination.quiz.questions.map((question, index) => {
                const answer = examination.answers.find(
                  (a) => a.questionId === question.id
                );
                const isCorrect = answer?.isCorrect;

                return (
                  <div
                    key={question.id}
                    className={`p-4 border rounded-lg ${
                      isCorrect
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : "border-red-500 bg-red-50 dark:bg-red-950"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {isCorrect ? (
                          <CheckCircle2 className="size-5 text-green-600" />
                        ) : (
                          <XCircle className="size-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-2">
                          Question {index + 1}: {question.text}
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Your answer: </span>
                            {answer ? (
                              question.type === "multiple-choice" ? (
                                <span>{question.options[parseInt(answer.answer)] || answer.answer}</span>
                              ) : (
                                <span>{answer.answer}</span>
                              )
                            ) : (
                              <span className="text-muted-foreground">Not answered</span>
                            )}
                          </div>
                          <div className="text-green-700 dark:text-green-400">
                            <span className="font-medium">Correct answer: </span>
                            {question.type === "multiple-choice" ? (
                              <span>{question.options[parseInt(question.correctAnswer)] || question.correctAnswer}</span>
                            ) : question.type === "true-false" ? (
                              <span>{question.correctAnswer === "true" ? "True" : "False"}</span>
                            ) : (
                              <span>{question.correctAnswer}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium">Points: </span>
                            {answer?.pointsEarned || 0} / {question.points}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={handleDownloadPDF}
            disabled={downloading}
            variant="outline"
            className="gap-2"
          >
            <Download className="size-4" />
            {downloading ? "Generating..." : "Download Result (PDF)"}
          </Button>
          <Link href={user?.role === "student" ? "/dashboard/student" : user?.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student"}>
            <Button className="gap-2">
              <Home className="size-4" />
              Back to Dashboard
            </Button>
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
