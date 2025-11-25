import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, Settings, Users, Database } from "lucide-react";

export function AdminSystemStatus() {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>System Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full justify-start gap-2 bg-transparent"
            variant="outline"
            asChild
          >
            <a href="/dashboard/admin/settings">
              <Settings className="size-4" />
              System Settings
            </a>
          </Button>
          <Button
            className="w-full justify-start gap-2 bg-transparent"
            variant="outline"
            asChild
          >
            <a href="/dashboard/admin/reports">
              <BarChart3 className="size-4" />
              View Reports
            </a>
          </Button>
          <Button
            className="w-full justify-start gap-2 bg-transparent"
            variant="outline"
            asChild
          >
            <a href="/dashboard/admin/audit-logs">
              <Users className="size-4" />
              Audit Logs
            </a>
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
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-600"
            >
              Online
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <BarChart3 className="size-4 text-muted-foreground" />
              API Server
            </span>
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-600"
            >
              Online
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Database className="size-4 text-muted-foreground" />
              Storage
            </span>
            <Badge
              variant="default"
              className="bg-green-600 hover:bg-green-600"
            >
              Online
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
