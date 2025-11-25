import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, BookOpen, Plus, Shield, GraduationCap } from "lucide-react";
import { AdminStats as AdminStatsType } from "@/hooks/use-admin-dashboard";

interface AdminManagementProps {
  stats: AdminStatsType;
}

export function AdminManagement({ stats }: AdminManagementProps) {
  return (
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
              href: "/dashboard/admin/users/teachers",
            },
            {
              type: "Students",
              count: stats.totalStudents,
              action: "Manage Students",
              icon: Users,
              href: "/dashboard/admin/users/students",
            },
            {
              type: "Administrators",
              count: 2,
              action: "Manage Admins",
              icon: Shield,
              href: "/dashboard/admin/users/admins",
            },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all duration-200 group">
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="ml-4 shrink-0"
                    asChild
                  >
                    <a href={item.href}>{item.action}</a>
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
            asChild
          >
            <a href="/dashboard/admin/courses">
              <Plus className="size-4" />
              Manage Courses
            </a>
          </Button>
          <Button
            className="w-full justify-start gap-2 bg-transparent"
            variant="outline"
            asChild
          >
            <a href="/dashboard/admin/departments">
              <Plus className="size-4" />
              Manage Departments
            </a>
          </Button>
          {/* Class management skipped as per schema limitations */}
        </CardContent>
      </Card>
    </div>
  );
}
