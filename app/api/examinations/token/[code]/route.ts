import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/examinations/token/[code]
 * Verify and get examination by token code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const authResult = await requireRole(request, ["student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { code } = await params;

  try {
    const examination = await prisma.examination.findUnique({
      where: { tokenCode: code },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
            timeLimit: true,
            bonusEnabled: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!examination) {
      return errorResponse("Invalid examination token", 404);
    }

    // Verify the examination belongs to the current user
    if (examination.studentId !== user.id) {
      return errorResponse("This examination token belongs to another student", 403);
    }

    return successResponse(examination);
  } catch (error: any) {
    console.error("Error verifying token:", error);
    return errorResponse(error.message || "Failed to verify token", 500);
  }
}
