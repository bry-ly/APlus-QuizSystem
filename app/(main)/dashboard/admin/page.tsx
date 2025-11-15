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
import { Separator } from "@/components/ui/separator";
import { Users, BookOpen, BarChart3, Settings, Plus, Shield, GraduationCap, Database } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalQuizzes: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalQuizzes: 0,
  });
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          if ((session.data.user as any).role !== "admin") {
            router.push("/");
            return;
          }
          setUser(session.data.user);

          // Fetch dashboard stats
          const statsResponse = await fetch("/api/dashboard/stats");
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(statsData.data || {
              totalUsers: 0,
              totalTeachers: 0,
              totalStudents: 0,
              totalQuizzes: 0,
            });
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
        <AppSidebar variant="inset" role="admin" />
        <SidebarInset>
          <SiteHeader title="Admin Dashboard" />
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

  const userRole = user?.role || "admin"
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
        <SiteHeader title="Admin Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-7xl mx-auto w-full px-4">
        {/* Welcome Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              System overview and management
            </p>
          </div>
          <Button className="gap-2">
            <Settings className="size-4" />
            System Settings
          </Button>
        </div>

        {/* Section Cards */}
        <div className="mb-8">
          <SectionCards
            cards={[
              {
                title: "Total Users",
                value: stats.totalUsers,
                change: stats.totalUsers > 0 ? 5 : 0,
                changeLabel: "Active users",
                description: "System users",
                trend: "up",
              },
              {
                title: "Teachers",
                value: stats.totalTeachers,
                change: stats.totalTeachers > 0 ? 2 : 0,
                changeLabel: "Faculty members",
                description: "Teaching staff",
                trend: "up",
              },
              {
                title: "Students",
                value: stats.totalStudents,
                change: stats.totalStudents > 0 ? 8 : 0,
                changeLabel: "Enrolled students",
                description: "Active learners",
                trend: "up",
              },
              {
                title: "Total Quizzes",
                value: stats.totalQuizzes,
                change: stats.totalQuizzes > 0 ? 12 : 0,
                changeLabel: "In the system",
                description: "All quizzes",
                trend: "up",
              },
            ]}
            role="admin"
          />
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Management */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage teachers, students, and administrators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    type: "Teachers",
                    count: stats.totalTeachers,
                    action: "Manage Teachers",
                    icon: GraduationCap,
                  },
                  {
                    type: "Students",
                    count: stats.totalStudents,
                    action: "Manage Students",
                    icon: Users,
                  },
                  { type: "Administrators", count: 2, action: "Manage Admins", icon: Shield },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx}>
                      <div
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
                            <Icon className="size-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base">{item.type}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.count} total
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="ml-4 shrink-0">
                          {item.action}
                        </Button>
                      </div>
                      {idx < 2 && <Separator className="my-4" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Course Management */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="size-5" />
                  Course Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <Plus className="size-4" />
                  Add New Course
                </Button>
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <Plus className="size-4" />
                  Add New Department
                </Button>
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <Plus className="size-4" />
                  Add New Class
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Management */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>System Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <Settings className="size-4" />
                  System Settings
                </Button>
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <BarChart3 className="size-4" />
                  View Reports
                </Button>
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <Users className="size-4" />
                  Audit Logs
                </Button>
              </CardContent>
            </Card>

            {/* System Status */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Database className="size-4 text-muted-foreground" />
                    Database
                  </span>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                    Online
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="size-4 text-muted-foreground" />
                    API Server
                  </span>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                    Online
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2">
                    <Database className="size-4 text-muted-foreground" />
                    Storage
                  </span>
                  <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                    Online
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-8">
          <ChartAreaInteractive
            title="System Activity"
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
            role="admin"
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
