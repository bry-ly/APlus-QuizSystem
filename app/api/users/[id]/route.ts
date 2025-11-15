import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/users/[id]
 * Get user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: currentUser } = authResult;
  const { id } = await params;

  try {
    // Students can only view their own profile
    if (currentUser.role === "student" && currentUser.id !== id) {
      return errorResponse("Forbidden - You can only view your own profile", 403);
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        courseId: true,
        departmentId: true,
        emailVerified: true,
        image: true,
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
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    return successResponse(user);
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return errorResponse(error.message || "Failed to fetch user", 500);
  }
}

/**
 * PATCH /api/users/[id]
 * Update user by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user: currentUser } = authResult;
  const { id } = await params;

  try {
    // Students can only update their own profile, and limited fields
    if (currentUser.role === "student" && currentUser.id !== id) {
      return errorResponse("Forbidden - You can only update your own profile", 403);
    }

    const body = await request.json();
    const { firstName, lastName, email, role, courseId, departmentId, image } = body;

    // Students cannot change role, courseId, or departmentId
    if (currentUser.role === "student") {
      if (role || courseId || departmentId) {
        return errorResponse(
          "Forbidden - Students cannot change role or assignments",
          403
        );
      }
    }

    // Teachers can only update students in their department
    if (currentUser.role === "teacher") {
      const targetUser = await prisma.user.findUnique({
        where: { id },
        select: { role: true, departmentId: true },
      });

      if (!targetUser) {
        return errorResponse("User not found", 404);
      }

      if (
        targetUser.role !== "student" ||
        targetUser.departmentId !== currentUser.departmentId
      ) {
        return errorResponse(
          "Forbidden - You can only update students in your department",
          403
        );
      }
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (image !== undefined) updateData.image = image;

    // Only admins can change these
    if (currentUser.role === "admin") {
      if (role !== undefined) updateData.role = role;
      if (courseId !== undefined) updateData.courseId = courseId;
      if (departmentId !== undefined) updateData.departmentId = departmentId;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        courseId: true,
        departmentId: true,
        image: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return errorResponse(error.message || "Failed to update user", 500);
  }
}

/**
 * DELETE /api/users/[id]
 * Delete user by ID (Admin only)
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
    await prisma.user.delete({
      where: { id },
    });

    return successResponse({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return errorResponse(error.message || "Failed to delete user", 500);
  }
}
