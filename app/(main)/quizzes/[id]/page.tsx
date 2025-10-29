"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
} from "lucide-react";
import Link from "next/link";

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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUser(session.data.user);
          // Check if this is a teacher preview (from the URL or user role)
          const urlParams = new URLSearchParams(window.location.search);
          setIsPreview(urlParams.get('preview') === 'true' || session.data.user.role === 'teacher');
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
    if (quizId && user) {
      // Mock quiz data - replace with actual API call
      const mockQuiz: Quiz = {
        id: quizId,
        title: "Mathematics Basics",
        description: "Test your knowledge of basic mathematical concepts including algebra, geometry, and arithmetic.",
        subject: "Mathematics",
        totalQuestions: 20,
        timeLimit: 30,
        passingScore: 70,
        createdAt: "2024-10-15",
        status: "published",
        questions: [
          {
            id: "1",
            question: "What is 2 + 2?",
            options: ["3", "4", "5", "6"],
            correctAnswer: 1,
          },
          {
            id: "2",
            question: "What is the square root of 16?",
            options: ["2", "4", "6", "8"],
            correctAnswer: 1,
          },
        ],
      };

      // Mock attempt data for students
      if (user.role === 'student') {
        const mockAttempt: QuizAttempt = {
          id: "attempt-1",
          quizId: quizId,
          score: 18,
          totalScore: 20,
          completedAt: "2024-10-16T10:30:00Z",
          status: "completed",
        };
        setAttempt(mockAttempt);
      }

      setQuiz(mockQuiz);
    }
  }, [quizId, user]);

  const handleStartQuiz = () => {
    router.push(`/main/quizzes/${quizId}/take`);
  };

  const handleReviewQuiz = () => {
    router.push(`/main/quizzes/${quizId}/review`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="size-12 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Quiz Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The quiz you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/main/quizzes">
              <Button>Back to Quizzes</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';
  const hasCompleted = attempt?.status === 'completed';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link href="/main/quizzes">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="size-4" />
              Back to Quizzes
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{quiz.title}</h1>
                <Badge variant={quiz.status === 'published' ? 'default' : 'secondary'}>
                  {quiz.status === 'published' ? 'Published' : 'Draft'}
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
                  <Link href={`/main/quizzes/${quiz.id}/edit`}>
                    <Button className="gap-2">
                      <Edit2 className="size-4" />
                      Edit
                    </Button>
                  </Link>
                </>
              )}

              {isStudent && (
                <Button
                  onClick={hasCompleted ? handleReviewQuiz : handleStartQuiz}
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

        {/* Quiz Stats for Students */}
        {isStudent && attempt && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Previous Attempt</CardTitle>
              <CardDescription>
                Completed on {new Date(attempt.completedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {attempt.score}/{attempt.totalScore}
                  </div>
                  <p className="text-sm text-muted-foreground">Your Score</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round((attempt.score / attempt.totalScore) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    (attempt.score / attempt.totalScore) * 100 >= quiz.passingScore
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {(attempt.score / attempt.totalScore) * 100 >= quiz.passingScore ? 'Passed' : 'Failed'}
                  </div>
                  <p className="text-sm text-muted-foreground">Status</p>
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
                    <p className="text-sm font-medium text-muted-foreground">Subject</p>
                    <p className="font-semibold">{quiz.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Questions</p>
                    <p className="font-semibold">{quiz.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Time Limit</p>
                    <p className="font-semibold">{quiz.timeLimit} minutes</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Passing Score</p>
                    <p className="font-semibold">{quiz.passingScore}%</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Created</p>
                  <p className="font-semibold">
                    {new Date(quiz.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
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
                    <Link href={`/main/quizzes/${quiz.id}/edit`}>
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
                      onClick={hasCompleted ? handleReviewQuiz : handleStartQuiz}
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
                      <Link href={`/main/quizzes/result/${attempt.id}`}>
                        <Button className="w-full gap-2" variant="outline">
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
  );
}
