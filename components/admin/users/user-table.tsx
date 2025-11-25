"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User } from "@/hooks/use-users";
import { UserActions } from "./user-actions";
import { format } from "date-fns";

interface UserTableProps {
  users: User[];
  role?: "student" | "teacher" | "admin";
  onDelete: (id: string) => void;
  onEdit?: (user: User) => void;
}

export function UserTable({ users, role, onDelete, onEdit }: UserTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            {role === "student" && <TableHead>Course</TableHead>}
            {role === "teacher" && <TableHead>Department</TableHead>}
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={role === "student" || role === "teacher" ? 6 : 5}
                className="h-24 text-center"
              >
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                {role === "student" && (
                  <TableCell>
                    {user.course ? (
                      <Badge variant="secondary">{user.course.code}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                {role === "teacher" && (
                  <TableCell>
                    {user.department ? (
                      <Badge variant="secondary">{user.department.code}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  {format(new Date(user.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <UserActions
                    user={user}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
