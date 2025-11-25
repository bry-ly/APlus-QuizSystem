"use client";

import { useCallback } from "react";

import Link from "next/link";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { DashboardLayout } from "@/components/dashboard-layout";
import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
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
import { Users, BookOpen, BarChart3, Plus } from "lucide-react";
import { CreationSection } from "@/components/creation-section";

interface Course {
  id: string;
  name: string;
  code: string;
  students: object[];
  quizzes: object[];
}

interface Quiz {
  id: string;
  title: string;
  createdAt: string | Date;
  _count: {
    examinations: number;
  };
}

export default function TeacherDashboard() {
  const fetchTeacherData = useCallback(async () => {
    const [statsRes, coursesRes, quizzesRes] = await Promise.all([
      fetch("/api/dashboard/stats"),
      fetch("/api/courses"),
      fetch("/api/quizzes"),
    ]);

    const statsData = statsRes.ok
      ? await statsRes.json()
      : {
          data: {
            totalStudents: 0,
            totalQuizzes: 0,
            averageClassScore: 0,
            activeClasses: 0,
          },
        };
    const coursesData = coursesRes.ok ? await coursesRes.json() : { data: [] };
    const quizzesData = quizzesRes.ok ? await quizzesRes.json() : { data: [] };

    return {
      stats: statsData.data,
      courses: coursesData.data || [],
      quizzes: quizzesData.data || [],
    };
  }, []);

  const { user, data, loading } = useDashboardData({
    role: "teacher",
    fetchDataFn: fetchTeacherData,
  });

  const stats = data?.stats || {
    totalStudents: 0,
    totalQuizzes: 0,
    averageClassScore: 0,
    activeClasses: 0,
  };
  const courses = data?.courses || [];
  const quizzes = data?.quizzes || [];

  if (loading) {
    return (
      <DashboardLayout role="teacher" title="Teacher Dashboard">
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
      </DashboardLayout>
    );
  }

  const userRole = user?.role || "teacher";
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
    <DashboardLayout role={userRole} user={userData} title="Teacher Dashboard">
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
              change:
                stats.averageClassScore >= 70
                  ? 5
                  : stats.averageClassScore >= 50
                  ? 0
                  : -5,
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
                      Create your first course to start managing quizzes and
                      students
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
                courses.map((course: Course, index: number) => (
                  <div key={course.id}>
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-base">
                            {course.name}
                          </h3>
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-4 shrink-0"
                      >
                        Manage
                      </Button>
                    </div>
                    {index < courses.length - 1 && (
                      <Separator className="my-4" />
                    )}
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
            .map((quiz: Quiz) => {
              const date = quiz.createdAt
                ? typeof quiz.createdAt === "string"
                  ? quiz.createdAt
                  : new Date(quiz.createdAt).toISOString()
                : new Date().toISOString();
              return {
                date,
                value: quiz._count?.examinations || 0,
              };
            })
            .sort(
              (a: { date: string }, b: { date: string }) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            )}
          dataKey="value"
          label="Quiz Attempts"
          role="teacher"
        />
      </div>
    </DashboardLayout>
  );
}
