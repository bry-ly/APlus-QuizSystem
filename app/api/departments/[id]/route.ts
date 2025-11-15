import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/departments/[id]
 * Get department by ID with teacher list
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "teacher"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { id } = await params;

  try {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        teachers: {
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

    if (!department) {
      return errorResponse("Department not found", 404);
    }

    return successResponse(department);
  } catch (error: any) {
    console.error("Error fetching department:", error);
    return errorResponse(error.message || "Failed to fetch department", 500);
  }
}

/**
 * PATCH /api/departments/[id]
 * Update department by ID (Admin only)
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

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: updateData,
    });

    return successResponse(updatedDepartment);
  } catch (error: any) {
    console.error("Error updating department:", error);
    return errorResponse(error.message || "Failed to update department", 500);
  }
}

/**
 * DELETE /api/departments/[id]
 * Delete department by ID (Admin only)
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
    // Check if department has teachers
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            teachers: true,
          },
        },
      },
    });

    if (!department) {
      return errorResponse("Department not found", 404);
    }

    if (department._count.teachers > 0) {
      return errorResponse(
        "Cannot delete department with assigned teachers. Please reassign teachers first.",
        400
      );
    }

    await prisma.department.delete({
      where: { id },
    });

    return successResponse({ message: "Department deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting department:", error);
    return errorResponse(error.message || "Failed to delete department", 500);
  }
}
