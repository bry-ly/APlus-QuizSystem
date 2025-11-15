"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
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
import { Separator } from "@/components/ui/separator";
import { Users, BookOpen, BarChart3, Plus, TrendingUp, GraduationCap } from "lucide-react";
import Link from "next/link";
import { CreationSection } from "@/components/creation-section";

interface TeacherStats {
  totalStudents: number;
  totalQuizzes: number;
  averageClassScore: number;
  activeClasses: number;
}

interface Course {
  id: string;
  name: string;
  code: string;
  students: any[];
  quizzes: any[];
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 0,
    totalQuizzes: 0,
    averageClassScore: 0,
    activeClasses: 0,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          if ((session.data.user as any).role !== "teacher") {
            router.push("/");
            return;
          }
          setUser(session.data.user);

          // Fetch dashboard stats
          const statsResponse = await fetch("/api/dashboard/stats");
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData.data);
          }

          // Fetch courses
          const coursesResponse = await fetch("/api/courses");
          if (coursesResponse.ok) {
            const coursesData = await coursesResponse.json();
            setCourses(coursesData.data || []);
          }

          // Fetch quizzes for chart data
          const quizzesResponse = await fetch("/api/quizzes");
          if (quizzesResponse.ok) {
            const quizzesData = await quizzesResponse.json();
            setQuizzes(quizzesData.data || []);
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

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
          <SiteHeader title="Teacher Dashboard" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="max-w-7xl mx-auto w-full px-4">
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
                            <Skeleton key={i} className="h-20 w-full" />
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                    <div>
                      <Card>
                        <CardHeader>
                          <Skeleton className="h-6 w-32" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                          ))}
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

  const userRole = user?.role || "teacher"
  const userData = user ? {
    name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    email: user.email,
    avatar: user.image,
    firstName: user.firstName,
  } : undefined

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
        <SiteHeader title="Teacher Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-7xl mx-auto w-full px-4">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground">
              Manage your courses, quizzes, and student progress
            </p>
          </div>
          <Link href="/quizzes/create">
            <Button className="gap-2">
              <Plus className="size-4" />
              Create Quiz
            </Button>
          </Link>
        </div>

        {/* Creation Section */}
        <CreationSection />

        {/* Section Cards */}
        <div className="mb-8">
          <SectionCards
            cards={[
              {
                title: "Total Students",
                value: stats.totalStudents,
                change: stats.totalStudents > 0 ? 5 : 0,
                changeLabel: "Across all classes",
                description: "Students enrolled",
                trend: "up",
              },
              {
                title: "Total Quizzes",
                value: stats.totalQuizzes,
                change: stats.totalQuizzes > 0 ? 10 : 0,
                changeLabel: "Created this semester",
                description: "Your quiz collection",
                trend: "up",
              },
              {
                title: "Average Score",
                value: `${stats.averageClassScore}%`,
                change: stats.averageClassScore >= 70 ? 5 : stats.averageClassScore >= 50 ? 0 : -5,
                changeLabel: "Class average",
                description: "Student performance",
                trend: stats.averageClassScore >= 70 ? "up" : "down",
              },
              {
                title: "Active Classes",
                value: stats.activeClasses,
                change: stats.activeClasses > 0 ? 2 : 0,
                changeLabel: "Currently teaching",
                description: "Active courses",
                trend: "up",
              },
            ]}
            role="teacher"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Classes */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  My Classes
                </CardTitle>
                <CardDescription>
                  Manage your courses and student enrollment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {courses.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia>
                        <BookOpen className="size-12 text-muted-foreground" />
                      </EmptyMedia>
                      <EmptyTitle>No courses found</EmptyTitle>
                      <EmptyDescription>
                        Create your first course to start managing quizzes and students
                      </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                      <Link href="/courses/create">
                        <Button className="mt-4">
                          <Plus className="size-4 mr-2" />
                          Add Course
                        </Button>
                      </Link>
                    </EmptyContent>
                  </Empty>
                ) : (
                  courses.map((course, index) => (
                    <div key={course.id}>
                      <div
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-base">{course.name}</h3>
                            <Badge variant="outline" className="shrink-0">
                              {course.code}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Users className="size-4" />
                              {course.students?.length || 0} students
                            </span>
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="size-4" />
                              {course.quizzes?.length || 0} quizzes
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4 shrink-0">
                          Manage
                        </Button>
                      </div>
                      {index < courses.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))
                )}
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
                <Link href="/quizzes/create">
                  <Button
                    className="w-full justify-start gap-2 bg-transparent"
                    variant="outline"
                  >
                    <Plus className="size-4" />
                    Create New Quiz
                  </Button>
                </Link>
                <Link href="/courses/create">
                  <Button
                    className="w-full justify-start gap-2 bg-transparent"
                    variant="outline"
                  >
                    <Plus className="size-4" />
                    Add Course
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button
                    className="w-full justify-start gap-2 bg-transparent"
                    variant="outline"
                  >
                    <BarChart3 className="size-4" />
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="pb-3 border-b">
                  <p className="font-medium">Quiz submitted</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    John Doe - 2 hours ago
                  </p>
                </div>
                <div className="pb-3 border-b">
                  <p className="font-medium">New enrollment</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Jane Smith - 5 hours ago
                  </p>
                </div>
                <div>
                  <p className="font-medium">Quiz created</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You - 1 day ago
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <ChartAreaInteractive
            title="Quiz Activity"
            description="Quizzes created over time"
            data={quizzes
              .map((quiz) => {
                const date = quiz.createdAt 
                  ? (typeof quiz.createdAt === 'string' 
                      ? quiz.createdAt 
                      : new Date(quiz.createdAt).toISOString())
                  : new Date().toISOString()
                return {
                  date,
                  value: quiz._count?.examinations || 0,
                }
              })
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())}
            dataKey="value"
            label="Quiz Attempts"
            role="teacher"
          />
        </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
