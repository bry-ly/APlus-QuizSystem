"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDepartments } from "@/hooks/use-departments";
import { DepartmentTable } from "@/components/admin/courses/department-table";

export default function DepartmentsPage() {
  const { departments, loading } = useDepartments();

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
        <SiteHeader title="Course Management: Departments" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-7xl mx-auto w-full px-4">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Departments</h1>
                    <p className="text-muted-foreground">
                      Manage academic departments
                    </p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="size-4" />
                    Add Department
                  </Button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <DepartmentTable departments={departments} />
                )}
              </main>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
