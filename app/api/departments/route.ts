import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from "@/lib/api-middleware";

/**
 * GET /api/departments
 * Get all departments
 */
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            teachers: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return successResponse(departments);
  } catch (error: any) {
    console.error("Error fetching departments:", error);
    return errorResponse(error.message || "Failed to fetch departments", 500);
  }
}

/**
 * POST /api/departments
 * Create a new department (Admin only)
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

    // Check if department code already exists
    const existingDepartment = await prisma.department.findUnique({
      where: { code },
    });

    if (existingDepartment) {
      return errorResponse("Department with this code already exists", 409);
    }

    const newDepartment = await prisma.department.create({
      data: {
        id: crypto.randomUUID(),
        name,
        code,
      },
    });

    return successResponse(newDepartment, 201);
  } catch (error: any) {
    console.error("Error creating department:", error);
    return errorResponse(error.message || "Failed to create department", 500);
  }
}
