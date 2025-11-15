import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from "@/lib/api-middleware";

/**
 * GET /api/users
 * Get all users (Admin only) or filtered by role
 */
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "teacher"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");
  const courseId = searchParams.get("courseId");
  const departmentId = searchParams.get("departmentId");

  try {
    const whereClause: any = {};

    // Admin can see all users, teachers can see students in their department
    if (user.role === "teacher") {
      whereClause.OR = [
        { role: "student", departmentId: user.departmentId },
        { id: user.id },
      ];
    }

    if (role) {
      whereClause.role = role;
    }

    if (courseId) {
      whereClause.courseId = courseId;
    }

    if (departmentId) {
      whereClause.departmentId = departmentId;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        courseId: true,
        departmentId: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return errorResponse(error.message || "Failed to fetch users", 500);
  }
}

/**
 * POST /api/users
 * Create a new user (Admin only)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const body = await request.json();
    const validationError = validateRequiredFields(body, [
      "firstName",
      "lastName",
      "email",
      "role",
    ]);

    if (validationError) {
      return errorResponse(validationError, 400);
    }

    const { firstName, lastName, email, role, courseId, departmentId } = body;

    // Create full name from firstName and lastName
    const name = `${firstName} ${lastName}`;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("User with this email already exists", 409);
    }

    // Validate role-specific requirements
    if (role === "student" && !courseId) {
      return errorResponse("Students must be assigned to a course", 400);
    }

    if (role === "teacher" && !departmentId) {
      return errorResponse("Teachers must be assigned to a department", 400);
    }

    const newUser = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        name,
        firstName,
        lastName,
        email,
        role,
        courseId: role === "student" ? courseId : null,
        departmentId: role === "teacher" ? departmentId : null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        courseId: true,
        departmentId: true,
        createdAt: true,
      },
    });

    return successResponse(newUser, 201);
  } catch (error: any) {
    console.error("Error creating user:", error);
    return errorResponse(error.message || "Failed to create user", 500);
  }
}
