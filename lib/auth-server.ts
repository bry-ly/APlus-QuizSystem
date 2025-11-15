import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Get the current session in a Server Component or Server Action
 * @returns The session object or null if not authenticated
 */
export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

/**
 * Require authentication in a Server Component or Server Action
 * Redirects to /login if not authenticated
 * @returns The session object
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * Get the current user in a Server Component or Server Action
 * @returns The user object or null if not authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Check if the user is authenticated
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const session = await getSession();
  return !!session;
}

/**
 * Check if the current user is an admin
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === "admin";
}

/**
 * Check if the current user is a teacher
 * @returns true if user is teacher, false otherwise
 */
export async function isTeacher() {
  const session = await getSession();
  return session?.user?.role === "teacher";
}

/**
 * Check if the current user is a student
 * @returns true if user is student, false otherwise
 */
export async function isStudent() {
  const session = await getSession();
  return session?.user?.role === "student";
}

/**
 * Get the current user's role
 * @returns "student" | "teacher" | "admin" | null
 */
export async function getUserRole() {
  const session = await getSession();
  return session?.user?.role ?? null;
}

/**
 * Require admin role in a Server Component or Server Action
 * Redirects to home page (/) if not admin or not authenticated
 * @returns The session object
 */
export async function requireAdmin() {
  const session = await requireAuth();

  if (session.user?.role !== "admin") {
    redirect("/admin");
  }

  return session;
}

/**
 * Require teacher role in a Server Component or Server Action
 * Redirects to /teachers if not teacher or not authenticated
 * @returns The session object
 */
export async function requireTeacher() {
  const session = await requireAuth();

  if (session.user?.role !== "teacher") {
    redirect("/teachers");
  }

  return session;
}

/**
 * Require admin or teacher role in a Server Component or Server Action
 * Redirects to /students if neither admin nor teacher
 * @returns The session object
 */
export async function requireStaff() {
  const session = await requireAuth();

  const role = session.user?.role;
  if (role !== "admin" && role !== "teacher") {
    redirect("/students");
  }

  return session;
}
