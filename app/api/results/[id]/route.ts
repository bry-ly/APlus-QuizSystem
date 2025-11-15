import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/results/[id]
 * Get detailed result for a specific examination
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  try {
    const examination = await prisma.examination.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            questions: {
              select: {
                id: true,
                text: true,
                type: true,
                options: true,
                correctAnswer: true,
                points: true,
                order: true,
              },
              orderBy: {
                order: "asc",
              },
            },
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
        answers: {
          select: {
            id: true,
            questionId: true,
            answer: true,
            isCorrect: true,
            pointsEarned: true,
          },
        },
      },
    });

    if (!examination) {
      return errorResponse("Examination not found", 404);
    }

    // Check if examination is completed
    if (!examination.completedAt) {
      return errorResponse("Examination is not completed yet", 400);
    }

    // Students can only view their own results
    if (user.role === "student" && examination.studentId !== user.id) {
      return errorResponse("Forbidden - You can only view your own results", 403);
    }

    // Teachers can only view results for their quizzes
    if (user.role === "teacher" && examination.quiz.createdById !== user.id) {
      return errorResponse(
        "Forbidden - You can only view results for your quizzes",
        403
      );
    }

    // Check if quiz allows showing results
    if (user.role === "student" && !examination.quiz.showResults) {
      // Return limited information without answers
      return successResponse({
        id: examination.id,
        quiz: {
          id: examination.quiz.id,
          title: examination.quiz.title,
        },
        completedAt: examination.completedAt,
        score: examination.score,
        percentage: examination.percentage,
        passed: examination.passed,
        message: "Detailed results are not available for this quiz",
      });
    }

    // Combine questions with student answers
    const questionsWithAnswers = examination.quiz.questions.map((question) => {
      const studentAnswer = examination.answers.find(
        (ans) => ans.questionId === question.id
      );

      return {
        ...question,
        studentAnswer: studentAnswer?.answer,
        isCorrect: studentAnswer?.isCorrect,
        pointsEarned: studentAnswer?.pointsEarned || 0,
      };
    });

    return successResponse({
      id: examination.id,
      tokenCode: examination.tokenCode,
      quiz: {
        id: examination.quiz.id,
        title: examination.quiz.title,
        course: examination.quiz.course,
        passingScore: examination.quiz.passingScore,
      },
      student: examination.student,
      startedAt: examination.startedAt,
      completedAt: examination.completedAt,
      timeSpent: examination.timeSpent,
      bonusTimeEarned: examination.bonusTimeEarned,
      score: examination.score,
      percentage: examination.percentage,
      passed: examination.passed,
      questionsWithAnswers,
      summary: {
        totalQuestions: examination.quiz.questions.length,
        correctAnswers: examination.answers.filter((a) => a.isCorrect).length,
        incorrectAnswers: examination.answers.filter((a) => !a.isCorrect).length,
      },
    });
  } catch (error: any) {
    console.error("Error fetching result:", error);
    return errorResponse(error.message || "Failed to fetch result", 500);
  }
}
