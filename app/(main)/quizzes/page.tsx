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
import { Plus, Edit2, Trash2, Eye, Copy } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";

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
  studentCount?: number;
}

export default function QuizzesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: "1",
      title: "Mathematics Basics",
      description: "Test your knowledge of basic mathematical concepts",
      subject: "Mathematics",
      totalQuestions: 20,
      timeLimit: 30,
      passingScore: 70,
      createdAt: "2024-10-15",
      status: "published",
      studentCount: 45,
    },
    {
      id: "2",
      title: "English Literature",
      description: "Explore classic and modern literature",
      subject: "English",
      totalQuestions: 15,
      timeLimit: 25,
      passingScore: 65,
      createdAt: "2024-10-10",
      status: "published",
      studentCount: 38,
    },
    {
      id: "3",
      title: "Physics Fundamentals",
      description: "Understanding the basics of physics",
      subject: "Physics",
      totalQuestions: 25,
      timeLimit: 45,
      passingScore: 75,
      createdAt: "2024-10-05",
      status: "draft",
      studentCount: 0,
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

  const handleDelete = (id: string) => {
    setQuizzes(quizzes.filter((q) => q.id !== id));
  };

  const handleDuplicate = (quiz: Quiz) => {
    const newQuiz = {
      ...quiz,
      id: Math.random().toString(),
      title: `${quiz.title} (Copy)`,
      status: "draft" as const,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setQuizzes([newQuiz, ...quizzes]);
  };

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
            <h1 className="text-3xl font-bold mb-2">My Quizzes</h1>
            <p className="text-muted-foreground">
              Create and manage your quizzes
            </p>
          </div>
          <Link href="/main/quizzes/create">
            <Button className="gap-2">
              <Plus className="size-4" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizzes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.filter((q) => q.status === "published").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Drafts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.filter((q) => q.status === "draft").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quizzes List */}
        <Card>
          <CardHeader>
            <CardTitle>All Quizzes</CardTitle>
            <CardDescription>Manage your quiz collection</CardDescription>
          </CardHeader>
          <CardContent>
            {quizzes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No quizzes yet. Create your first quiz to get started!
                </p>
                <Link href="/main/quizzes/create">
                  <Button>Create Quiz</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            quiz.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                          }`}
                        >
                          {quiz.status === "published" ? "Published" : "Draft"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {quiz.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{quiz.totalQuestions} questions</span>
                        <span>{quiz.timeLimit} mins</span>
                        <span>Pass: {quiz.passingScore}%</span>
                        {quiz.studentCount !== undefined && (
                          <span>{quiz.studentCount} students</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/main/quizzes/${quiz.id}?preview=true`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="size-4" />
                          <span className="hidden sm:inline">Preview</span>
                        </Button>
                      </Link>
                      <Link href={`/main/quizzes/${quiz.id}/edit`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Edit2 className="size-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleDuplicate(quiz)}
                      >
                        <Copy className="size-4" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        <Trash2 className="size-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
