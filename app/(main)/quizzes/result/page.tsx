"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useResults } from "@/hooks/use-results";
import { ResultsStats } from "@/components/quiz/results-stats";
import { ResultsCharts } from "@/components/quiz/results-charts";
import { ResultsList } from "@/components/quiz/results-list";
import { DeleteResultDialog } from "@/components/quiz/delete-result-dialog";

export default function ResultsPage() {
  const {
    user,
    loading,
    results,
    deleteId,
    setDeleteId,
    handleDelete,
    confirmDelete,
  } = useResults();

  const userRole = user?.role || "student";
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
        <AppSidebar variant="inset" role="student" />
        <SidebarInset>
          <SiteHeader title="Quiz Results" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="max-w-7xl mx-auto w-full px-4">
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

  const completedResults = results.filter((r) => r.completedAt);
  const averageScore =
    completedResults.length > 0
      ? Math.round(
          completedResults.reduce((sum, r) => sum + (r.percentage || 0), 0) /
            completedResults.length
        )
      : 0;

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
        <SiteHeader title="Quiz Results" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-7xl mx-auto w-full px-4">
                {/* Overview */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">My Results</h1>
                  <p className="text-muted-foreground">
                    Track your quiz performance and progress
                  </p>
                </div>

                <ResultsStats
                  results={results}
                  averageScore={averageScore}
                  completedResults={completedResults}
                />

                <ResultsCharts completedResults={completedResults} />

                <ResultsList results={results} onDelete={handleDelete} />
              </main>
            </div>
          </div>
        </div>
        <DeleteResultDialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={confirmDelete}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
