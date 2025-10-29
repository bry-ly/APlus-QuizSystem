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
import { Users, BookOpen, BarChart3, Settings, Plus } from "lucide-react";

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
    totalUsers: 150,
    totalTeachers: 12,
    totalStudents: 138,
    totalQuizzes: 45,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          if (session.data.user.role !== "admin") {
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTeachers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Faculty members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Enrolled students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground mt-1">
                In the system
              </p>
            </CardContent>
          </Card>
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
                  },
                  {
                    type: "Students",
                    count: stats.totalStudents,
                    action: "Manage Students",
                  },
                  { type: "Administrators", count: 2, action: "Manage Admins" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{item.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.count} total
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {item.action}
                    </Button>
                  </div>
                ))}
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
                  <span>Database</span>
                  <span className="text-green-600 font-semibold">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>API Server</span>
                  <span className="text-green-600 font-semibold">Online</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Storage</span>
                  <span className="text-green-600 font-semibold">Online</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
