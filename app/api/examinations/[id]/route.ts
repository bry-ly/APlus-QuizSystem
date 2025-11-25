import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/examinations/[id]
 * Get examination by ID with answers
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, [
    "admin",
    "teacher",
    "student",
  ]);

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
              orderBy: {
                order: "asc",
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

    // Ensure bonusTimeEarned is included in response
    if (examination) {
      (examination as any).bonusTimeEarned = examination.bonusTimeEarned ?? 0;
    }

    if (!examination) {
      return errorResponse("Examination not found", 404);
    }

    // Students can only view their own examinations
    if (user.role === "student" && examination.studentId !== user.id) {
      return errorResponse(
        "Forbidden - You can only view your own examinations",
        403
      );
    }

    // Teachers can only view examinations for their quizzes
    if (user.role === "teacher" && examination.quiz.createdById !== user.id) {
      return errorResponse(
        "Forbidden - You can only view examinations for your quizzes",
        403
      );
    }

    return successResponse(examination);
  } catch (error: any) {
    console.error("Error fetching examination:", error);
    return errorResponse(error.message || "Failed to fetch examination", 500);
  }
}

/**
 * PATCH /api/examinations/[id]
 * Update examination (submit answer or complete exam)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  try {
    const body = await request.json();
    const { answers, complete } = body;

    // Get examination with quiz data
    const examination = await prisma.examination.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!examination) {
      return errorResponse("Examination not found", 404);
    }

    // Verify ownership
    if (examination.studentId !== user.id) {
      return errorResponse("Forbidden - This is not your examination", 403);
    }

    // Check if already completed
    if (examination.completedAt) {
      return errorResponse("This examination has already been completed", 400);
    }

    // If submitting answers
    if (answers && Array.isArray(answers)) {
      let bonusTimeToAdd = 0;

      for (const answer of answers) {
        const question = examination.quiz.questions.find(
          (q) => q.id === answer.questionId
        );

        if (!question) {
          continue;
        }

        // Check if answer is correct
        const isCorrect = answer.answer === question.correctAnswer;
        const pointsEarned = isCorrect ? question.points : 0;

        // Find existing answer to check if this is a new correct answer
        const existingAnswer = await prisma.examinationAnswer.findFirst({
          where: {
            examinationId: id,
            questionId: answer.questionId,
          },
        });

        // Calculate bonus time if this is a new correct answer and bonus is enabled
        if (
          isCorrect &&
          examination.quiz.bonusEnabled &&
          examination.quiz.bonusTime &&
          (!existingAnswer || !existingAnswer.isCorrect)
        ) {
          bonusTimeToAdd += examination.quiz.bonusTime;
        }

        if (existingAnswer) {
          // Update existing answer
          await prisma.examinationAnswer.update({
            where: { id: existingAnswer.id },
            data: {
              answer: answer.answer,
              isCorrect,
              pointsEarned,
            },
          });
        } else {
          // Create new answer
          await prisma.examinationAnswer.create({
            data: {
              id: crypto.randomUUID(),
              examinationId: id,
              questionId: answer.questionId,
              answer: answer.answer,
              isCorrect,
              pointsEarned,
            },
          });
        }
      }

      // Update bonus time earned if any was added
      if (bonusTimeToAdd > 0) {
        await prisma.examination.update({
          where: { id },
          data: {
            bonusTimeEarned: {
              increment: bonusTimeToAdd,
            },
          },
        });
      }
    }

    // If completing the examination
    if (complete) {
      // Calculate total score
      const allAnswers = await prisma.examinationAnswer.findMany({
        where: { examinationId: id },
      });

      const totalScore = allAnswers.reduce(
        (sum, ans) => sum + ans.pointsEarned,
        0
      );

      const maxScore = examination.quiz.questions.reduce(
        (sum, q) => sum + q.points,
        0
      );

      const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      const passed = percentage >= examination.quiz.passingScore;

      // Calculate time spent
      const timeSpent = examination.startedAt
        ? Math.floor((Date.now() - examination.startedAt.getTime()) / 1000)
        : 0;

      // Calculate bonus time earned
      const correctAnswers = allAnswers.filter((ans) => ans.isCorrect).length;
      const bonusTimeEarned =
        examination.quiz.bonusEnabled && examination.quiz.bonusTime
          ? correctAnswers * examination.quiz.bonusTime
          : 0;

      await prisma.examination.update({
        where: { id },
        data: {
          completedAt: new Date(),
          timeSpent,
          bonusTimeEarned,
          score: totalScore,
          percentage,
          passed,
        },
      });
    }

    // Return updated examination
    const updatedExamination = await prisma.examination.findUnique({
      where: { id },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            showResults: true,
            passingScore: true,
            bonusEnabled: true,
            bonusTime: true,
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

    // Get updated bonus time earned
    const examWithBonus = await prisma.examination.findUnique({
      where: { id },
      select: {
        bonusTimeEarned: true,
      },
    });

    return successResponse({
      ...updatedExamination,
      bonusTimeEarned: examWithBonus?.bonusTimeEarned || 0,
    });
  } catch (error: any) {
    console.error("Error updating examination:", error);
    return errorResponse(error.message || "Failed to update examination", 500);
  }
}

/**
 * DELETE /api/examinations/[id]
 * Delete examination
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, [
    "admin",
    "teacher",
    "student",
  ]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  try {
    const examination = await prisma.examination.findUnique({
      where: { id },
    });

    if (!examination) {
      return errorResponse("Examination not found", 404);
    }

    // Students can only delete their own examinations
    if (user.role === "student" && examination.studentId !== user.id) {
      return errorResponse(
        "Forbidden - You can only delete your own examinations",
        403
      );
    }

    await prisma.examination.delete({
      where: { id },
    });

    return successResponse({ message: "Examination deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting examination:", error);
    return errorResponse(error.message || "Failed to delete examination", 500);
  }
}
