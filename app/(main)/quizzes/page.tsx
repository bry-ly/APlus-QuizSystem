"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Eye, Copy, AlertTriangle, CheckCircle2, ListChecks, Clock } from "lucide-react";
import Link from "next/link";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  courseId: string;
  timeLimit: number | null;
  passingScore: number;
  isActive: boolean;
  createdAt: string;
  course: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    questions: number;
    examinations: number;
  };
}

export default function QuizzesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  
  // Dialog states
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; quiz: Quiz | null }>({
    open: false,
    quiz: null,
  });
  const [duplicateDialog, setDuplicateDialog] = useState<{ open: boolean; quiz: Quiz | null }>({
    open: false,
    quiz: null,
  });
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: "success" | "error";
    message: string;
  }>({
    open: false,
    type: "success",
    message: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  // Fetch quizzes from API
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const session = await authClient.getSession();
      if (session?.data?.user) {
        if ((session.data.user as any).role !== "teacher") {
          router.push("/");
          return;
        }
        setUser(session.data.user);

        // Fetch quizzes from API with cache busting
        const response = await fetch("/api/quizzes", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch quizzes");
        }
        const data = await response.json();
        console.log("Fetched quizzes:", data.data?.length || 0, "quizzes");
        setQuizzes(data.data || []);
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Failed to load quizzes");
      if (err.message?.includes("auth")) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [router]);

  // Refresh quizzes when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        fetchQuizzes();
      }
    };

    const handleFocus = () => {
      if (user) {
        fetchQuizzes();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user]);

  const openDeleteDialog = (quiz: Quiz) => {
    setDeleteDialog({ open: true, quiz });
  };

  const handleDelete = async () => {
    if (!deleteDialog.quiz) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/quizzes/${deleteDialog.quiz.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        setActionDialog({
          open: true,
          type: "error",
          message: error.error || "Failed to delete quiz",
        });
        return;
      }

      // Remove from local state
      setQuizzes(quizzes.filter((q) => q.id !== deleteDialog.quiz!.id));
      setDeleteDialog({ open: false, quiz: null });
      setActionDialog({
        open: true,
        type: "success",
        message: "Quiz deleted successfully!",
      });
    } catch (err: any) {
      console.error("Delete error:", err);
      setActionDialog({
        open: true,
        type: "error",
        message: "Failed to delete quiz. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDuplicateDialog = (quiz: Quiz) => {
    setDuplicateDialog({ open: true, quiz });
  };

  const handleDuplicate = async () => {
    if (!duplicateDialog.quiz) return;
    
    setIsDuplicating(true);
    try {
      const quiz = duplicateDialog.quiz;
      // Fetch full quiz details with questions
      const detailResponse = await fetch(`/api/quizzes/${quiz.id}?includeAnswers=true`);
      if (!detailResponse.ok) throw new Error("Failed to fetch quiz details");
      
      const detailData = await detailResponse.json();
      const fullQuiz = detailData.data;

      // Create new quiz with duplicated data
      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${quiz.title} (Copy)`,
          description: quiz.description,
          courseId: quiz.courseId,
          timeLimit: quiz.timeLimit,
          passingScore: quiz.passingScore,
          showResults: true,
          bonusEnabled: false,
          questions: fullQuiz.questions?.map((q: any) => ({
            text: q.text,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            points: q.points,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to duplicate quiz");

      const data = await response.json();
      setQuizzes([data.data, ...quizzes]);
      setDuplicateDialog({ open: false, quiz: null });
      setActionDialog({
        open: true,
        type: "success",
        message: "Quiz duplicated successfully!",
      });
    } catch (err: any) {
      console.error("Duplicate error:", err);
      setActionDialog({
        open: true,
        type: "error",
        message: "Failed to duplicate quiz. Please try again.",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  // Get unique subjects from courses
  const subjects = Array.from(new Set(quizzes.map((q) => q.course.name)));
  const filteredQuizzes = selectedSubject === "all" 
    ? quizzes 
    : quizzes.filter((q) => q.course.name === selectedSubject);

  const userRole = user?.role || "teacher"
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
        <AppSidebar variant="inset" role="teacher" />
        <SidebarInset>
          <SiteHeader title="My Quizzes" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="max-w-7xl mx-auto w-full px-4">
          <div className="mb-8">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <div className="mb-6">
            <Skeleton className="h-9 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
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
        <SiteHeader title="My Quizzes" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-7xl mx-auto w-full px-4">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Quizzes</h1>
            <p className="text-muted-foreground">
              Create and manage your quizzes
            </p>
          </div>
          <Link href="/quizzes/create">
            <Button className="gap-2">
              <Plus className="size-4" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {/* Subject Filter - ThatQuiz style */}
        {subjects.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSubject === "all" ? "default" : "outline"}
                onClick={() => setSelectedSubject("all")}
                size="sm"
              >
                All Subjects
              </Button>
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  variant={selectedSubject === subject ? "default" : "outline"}
                  onClick={() => setSelectedSubject(subject)}
                  size="sm"
                >
                  {subject}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
                Active
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.filter((q) => q.isActive).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.reduce((sum, q) => sum + q._count.questions, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {quizzes.reduce((sum, q) => sum + q._count.examinations, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Quizzes List */}
        <Card>
          <CardHeader>
            <CardTitle>All Quizzes</CardTitle>
            <CardDescription>Manage your quiz collection</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredQuizzes.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia>
                    <ListChecks className="size-12 text-muted-foreground" />
                  </EmptyMedia>
                  <EmptyTitle>
                    {quizzes.length === 0 
                      ? "No quizzes yet"
                      : `No quizzes found for ${selectedSubject}`}
                  </EmptyTitle>
                  <EmptyDescription>
                    {quizzes.length === 0 
                      ? "Create your first quiz to get started!"
                      : "Try selecting a different subject or create a new quiz."}
                  </EmptyDescription>
                </EmptyHeader>
                {quizzes.length === 0 && (
                  <EmptyContent>
                    <Link href="/quizzes/create">
                      <Button>
                        <Plus className="size-4 mr-2" />
                        Create Quiz
                      </Button>
                    </Link>
                  </EmptyContent>
                )}
              </Empty>
            ) : (
              <div className="space-y-4">
                {filteredQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-2 flex-wrap">
                        <h3 className="font-semibold text-base">{quiz.title}</h3>
                        <Badge variant="outline" className="shrink-0">
                          {quiz.course.name}
                        </Badge>
                        <Badge
                          variant={quiz.isActive ? "default" : "secondary"}
                          className="shrink-0"
                        >
                          {quiz.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      {quiz.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {quiz.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <ListChecks className="size-3.5" />
                          {quiz._count.questions} questions
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="size-3.5" />
                          {quiz.timeLimit ? `${quiz.timeLimit} mins` : "No limit"}
                        </span>
                        <span>Pass: {quiz.passingScore}%</span>
                        <span>{quiz._count.examinations} attempts</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/quizzes/${quiz.id}?preview=true`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="size-4" />
                          <span className="hidden sm:inline">Preview</span>
                        </Button>
                      </Link>
                      <Link href={`/quizzes/${quiz.id}/edit`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Edit2 className="size-4" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => openDuplicateDialog(quiz)}
                      >
                        <Copy className="size-4" />
                        <span className="hidden sm:inline">Duplicate</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-destructive hover:text-destructive"
                        onClick={() => openDeleteDialog(quiz)}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, quiz: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Delete Quiz
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>&quot;{deleteDialog.quiz?.title}&quot;</strong>?
              {(deleteDialog.quiz?._count.examinations ?? 0) > 0 && (
                <span className="block mt-2 text-yellow-600 dark:text-yellow-500">
                  ⚠️ This quiz has {deleteDialog.quiz?._count.examinations} student attempt(s).
                </span>
              )}
              <span className="block mt-2">This action cannot be undone.</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, quiz: null })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Confirmation Dialog */}
      <Dialog open={duplicateDialog.open} onOpenChange={(open) => setDuplicateDialog({ open, quiz: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="size-5" />
              Duplicate Quiz
            </DialogTitle>
            <DialogDescription>
              Create a copy of <strong>&quot;{duplicateDialog.quiz?.title}&quot;</strong>?
              <span className="block mt-2">
                This will create a new quiz with all {duplicateDialog.quiz?._count.questions} questions copied.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDuplicateDialog({ open: false, quiz: null })}
              disabled={isDuplicating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDuplicate}
              disabled={isDuplicating}
            >
              {isDuplicating ? "Duplicating..." : "Duplicate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success/Error Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionDialog.type === "success" ? (
                <CheckCircle2 className="size-5 text-green-600" />
              ) : (
                <AlertTriangle className="size-5 text-destructive" />
              )}
              {actionDialog.type === "success" ? "Success" : "Error"}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setActionDialog({ ...actionDialog, open: false })}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
              </main>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
