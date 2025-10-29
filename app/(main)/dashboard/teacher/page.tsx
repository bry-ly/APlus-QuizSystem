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
import { Users, BookOpen, BarChart3, Plus } from "lucide-react";

interface TeacherStats {
  totalStudents: number;
  totalQuizzes: number;
  averageClassScore: number;
  activeClasses: number;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TeacherStats>({
    totalStudents: 45,
    totalQuizzes: 12,
    averageClassScore: 78,
    activeClasses: 3,
  });

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
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {user?.firstName}!
            </h1>
            <p className="text-muted-foreground">
              Manage your courses, quizzes, and student progress
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="size-4" />
            Create Quiz
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all classes
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
                Created this semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.averageClassScore}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Class average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeClasses}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Currently teaching
              </p>
            </CardContent>
          </Card>
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
                {[
                  {
                    name: "Mathematics 101",
                    students: 30,
                    quizzes: 5,
                  },
                  {
                    name: "Physics Advanced",
                    students: 25,
                    quizzes: 4,
                  },
                  {
                    name: "Chemistry Basics",
                    students: 28,
                    quizzes: 3,
                  },
                ].map((cls, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <h3 className="font-semibold">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cls.students} students • {cls.quizzes} quizzes
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                ))}
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
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <Plus className="size-4" />
                  Create New Quiz
                </Button>
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <Users className="size-4" />
                  Manage Students
                </Button>
                <Button
                  className="w-full justify-start gap-2 bg-transparent"
                  variant="outline"
                >
                  <BarChart3 className="size-4" />
                  View Analytics
                </Button>
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
                  <p className="text-xs text-muted-foreground">
                    John Doe - 2 hours ago
                  </p>
                </div>
                <div className="pb-3 border-b">
                  <p className="font-medium">New enrollment</p>
                  <p className="text-xs text-muted-foreground">
                    Jane Smith - 5 hours ago
                  </p>
                </div>
                <div>
                  <p className="font-medium">Quiz created</p>
                  <p className="text-xs text-muted-foreground">
                    You - 1 day ago
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
