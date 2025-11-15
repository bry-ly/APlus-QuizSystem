import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/results
 * Get results/scores for examinations
 * Students can view their own results
 * Teachers can view results for their quizzes
 * Admins can view all results
 */
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get("quizId");
  const courseId = searchParams.get("courseId");

  try {
    const whereClause: any = {
      completedAt: { not: null }, // Only show completed examinations
    };

    // Students can only see their own results
    if (user.role === "student") {
      whereClause.studentId = user.id;
    }

    // Teachers can see results for their quizzes
    if (user.role === "teacher") {
      whereClause.quiz = {
        createdById: user.id,
      };
    }

    if (quizId) {
      whereClause.quizId = quizId;
    }

    if (courseId) {
      whereClause.quiz = {
        ...whereClause.quiz,
        courseId,
      };
    }

    const results = await prisma.examination.findMany({
      where: whereClause,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    // Calculate statistics
    const stats = {
      totalExaminations: results.length,
      passedExaminations: results.filter((r) => r.passed).length,
      failedExaminations: results.filter((r) => !r.passed).length,
      averageScore: results.length > 0
        ? results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length
        : 0,
    };

    return successResponse({
      results,
      stats,
    });
  } catch (error: any) {
    console.error("Error fetching results:", error);
    return errorResponse(error.message || "Failed to fetch results", 500);
  }
}
