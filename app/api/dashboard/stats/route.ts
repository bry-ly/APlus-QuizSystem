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

    // Get total quizzes created by this teacher
    const totalQuizzes = await prisma.quiz.count({
      where: { createdById: user.id },
    });

    // Get courses that have quizzes created by this teacher
    const courses = await prisma.course.findMany({
      where: {
        quizzes: {
          some: {
            createdById: user.id,
          },
        },
      },
      include: {
        students: true,
        quizzes: {
          where: { createdById: user.id },
          include: {
            examinations: {
              where: {
                completedAt: { not: null },
              },
            },
          },
        },
      },
    });

    // Calculate stats
    const totalStudents = courses.reduce(
      (sum: number, course: any) => sum + course.students.length,
      0
    );

    const activeClasses = courses.length;

    // Calculate average class score from all completed examinations
    let totalScore = 0;
    let totalExaminations = 0;

    courses.forEach((course: any) => {
      course.quizzes.forEach((quiz: any) => {
        quiz.examinations.forEach((exam: any) => {
          if (exam.percentage !== null) {
            totalScore += exam.percentage;
            totalExaminations++;
          }
        });
      });
    });

    const averageClassScore =
      totalExaminations > 0 ? Math.round(totalScore / totalExaminations) : 0;

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
