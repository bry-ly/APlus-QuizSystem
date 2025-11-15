import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
];

// Protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/quizzes/create",
  "/quizzes/edit",
  "/analytics",
  "/courses/create",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and API auth routes to pass through
  if (
    publicRoutes.includes(pathname) ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check if this is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // If it's a protected route, check authentication
  if (isProtectedRoute) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Allow all other routes (like /quizzes for viewing, etc.)
  return NextResponse.next();
}

export const config = {
  runtime: "nodejs",
  // Match all routes except static files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
