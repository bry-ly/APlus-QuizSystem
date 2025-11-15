import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/courses/[id]
 * Get course by ID with student list
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { id } = await params;

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            emailVerified: true,
          },
          orderBy: {
            lastName: "asc",
          },
        },
      },
    });

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    return successResponse(course);
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return errorResponse(error.message || "Failed to fetch course", 500);
  }
}

/**
 * PATCH /api/courses/[id]
 * Update course by ID (Admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { name, code } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    return successResponse(updatedCourse);
  } catch (error: any) {
    console.error("Error updating course:", error);
    return errorResponse(error.message || "Failed to update course", 500);
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete course by ID (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { id } = await params;

  try {
    // Check if course has students
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    if (course._count.students > 0) {
      return errorResponse(
        "Cannot delete course with enrolled students. Please reassign students first.",
        400
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    return successResponse({ message: "Course deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return errorResponse(error.message || "Failed to delete course", 500);
  }
}
