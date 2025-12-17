import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["teacher", "admin"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;

  try {
    // Use a single aggregated query to get all stats efficiently
    const [totalQuizzes, coursesData, examinationsData] = await Promise.all([
      // Get total quizzes created by this teacher
      prisma.quiz.count({
        where: { createdById: user.id },
      }),
      
      // Get courses with student count
      prisma.course.findMany({
        where: {
          quizzes: {
            some: {
              createdById: user.id,
            },
          },
        },
        select: {
          id: true,
          _count: {
            select: {
              students: true,
            },
          },
        },
      }),
      
      // Get examinations data directly with aggregation
      prisma.examination.findMany({
        where: {
          completedAt: { not: null },
          quiz: {
            createdById: user.id,
          },
        },
        select: {
          percentage: true,
        },
      }),
    ]);

    // Calculate stats from aggregated data
    const totalStudents = coursesData.reduce(
      (sum, course) => sum + course._count.students,
      0
    );

    const activeClasses = coursesData.length;

    // Calculate average class score from examinations
    const validExaminations = examinationsData.filter(
      (exam) => exam.percentage !== null
    );
    const averageClassScore =
      validExaminations.length > 0
        ? Math.round(
            validExaminations.reduce((sum, exam) => sum + (exam.percentage || 0), 0) /
              validExaminations.length
          )
        : 0;

    return successResponse({
      totalStudents,
      totalQuizzes,
      averageClassScore,
      activeClasses,
    });
  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return errorResponse("Failed to fetch dashboard stats", 500);
  }
}
