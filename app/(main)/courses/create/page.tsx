"use client";
import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateCoursePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          if ((session.data.user as any).role !== "teacher") {
            router.push("/");
            return;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create course");
      }

      router.push("/dashboard/teacher");
    } catch (err: any) {
      console.error("Error creating course:", err);
      setError(err.message || "Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          <SiteHeader title="Create Course" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="max-w-3xl mx-auto w-full px-4">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading...</p>
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
        <SiteHeader title="Create Course" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-3xl mx-auto w-full px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/teacher">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="size-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Add New Course</h1>
          <p className="text-muted-foreground">
            Create a new course for your students
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Enter the course name and code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Introduction to Computer Science"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="e.g., CS101"
                  value={formData.code}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  A unique identifier for this course
                </p>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                >
                  {submitting ? "Creating..." : "Create Course"}
                </Button>
                <Link href="/dashboard/teacher" className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
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
