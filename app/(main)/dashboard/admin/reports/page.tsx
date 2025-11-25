"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
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
        <SiteHeader title="System Reports" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-7xl mx-auto w-full px-4">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold mb-2">System Reports</h1>
                  <p className="text-muted-foreground">
                    View system performance and usage analytics
                  </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Revenue
                      </CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$0.00</div>
                      <p className="text-xs text-muted-foreground">
                        +0% from last month
                      </p>
                    </CardContent>
                  </Card>
                  {/* Add more placeholder cards as needed */}
                </div>

                <div className="mt-8 text-center py-12 border rounded-lg border-dashed">
                  <p className="text-muted-foreground">
                    Detailed reports will be available soon.
                  </p>
                </div>
              </main>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
