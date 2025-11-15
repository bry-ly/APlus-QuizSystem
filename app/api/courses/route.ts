import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from "@/lib/api-middleware";

/**
 * GET /api/courses
 * Get all courses
 */
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return successResponse(courses);
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return errorResponse(error.message || "Failed to fetch courses", 500);
  }
}

/**
 * POST /api/courses
 * Create a new course (Admin only)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const body = await request.json();
    const validationError = validateRequiredFields(body, ["name", "code"]);

    if (validationError) {
      return errorResponse(validationError, 400);
    }

    const { name, code } = body;

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });

    if (existingCourse) {
      return errorResponse("Course with this code already exists", 409);
    }

    const newCourse = await prisma.course.create({
      data: {
        id: crypto.randomUUID(),
        name,
        code,
      },
    });

    return successResponse(newCourse, 201);
  } catch (error: any) {
    console.error("Error creating course:", error);
    return errorResponse(error.message || "Failed to create course", 500);
  }
}
