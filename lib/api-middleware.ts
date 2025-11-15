import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export type UserRole = "student" | "teacher" | "admin";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    courseId?: string;
    departmentId?: string;
  };
}

/**
 * Middleware to authenticate requests and attach user to request
 */
export async function authenticate(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - No active session" },
        { status: 401 }
      );
    }

    // Attach user info to request for downstream use
    const user = {
      id: session.user.id,
      email: session.user.email,
      role: (session.user.role as UserRole) || "student",
      firstName: session.user.firstName as string,
      lastName: session.user.lastName as string,
      courseId: session.user.courseId as string | undefined,
      departmentId: session.user.departmentId as string | undefined,
    };

    return { user, session };
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole);
}

/**
 * Middleware to check role-based access
 */
export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
) {
  const authResult = await authenticate(request);

  if (authResult instanceof NextResponse) {
    return authResult; // Return error response
  }

  const { user } = authResult;

  if (!hasRole(user.role, allowedRoles)) {
    return NextResponse.json(
      {
        error: "Forbidden - Insufficient permissions",
        required: allowedRoles,
        current: user.role,
      },
      { status: 403 }
    );
  }

  return { user, session: authResult.session };
}

/**
 * Helper to create success response
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Helper to create error response
 */
export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): string | null {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }
  return null;
}
