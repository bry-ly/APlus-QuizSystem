import { redirect } from "next/navigation";

export default function UserManagementPage() {
  redirect("/dashboard/admin/users/teachers");
}
