"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings } from "lucide-react";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { AdminStats } from "@/components/admin/admin-stats";
import { AdminManagement } from "@/components/admin/admin-management";
import { AdminSystemStatus } from "@/components/admin/admin-system-status";

export default function AdminDashboard() {
  const { user, loading, stats, quizzes } = useAdminDashboard();

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

  const userRole = user?.role || "admin";
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

                <AdminStats stats={stats} />

                {/* Management Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <AdminManagement stats={stats} />
                  <AdminSystemStatus />
                </div>

                {/* Chart Section */}
                <div className="mb-8 mt-8">
                  <ChartAreaInteractive
                    title="System Activity"
                    description="Quizzes created over time"
                    data={quizzes
                      .map((quiz) => {
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
                        (a, b) =>
                          new Date(a.date).getTime() -
                          new Date(b.date).getTime()
                      )}
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
