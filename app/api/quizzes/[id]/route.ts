import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/quizzes/[id]
 * Get quiz by ID with questions
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
  const { searchParams } = new URL(request.url);
  const includeAnswers = searchParams.get("includeAnswers") === "true";

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        accessCode: true,
        courseId: true,
        createdById: true,
        timeLimit: true,
        passingScore: true,
        isActive: true,
        showResults: true,
        bonusEnabled: true,
        bonusTime: true,
        createdAt: true,
        updatedAt: true,
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        questions: includeAnswers || user.role !== "student"
          ? {
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
            }
          : {
              select: {
                id: true,
                text: true,
                type: true,
                options: true,
                points: true,
                order: true,
              },
              orderBy: {
                order: "asc",
              },
            },
        _count: {
          select: {
            examinations: true,
          },
        },
      },
    });

    // Ensure bonusEnabled and bonusTime are included
    if (quiz) {
      (quiz as any).bonusEnabled = quiz.bonusEnabled ?? false;
      (quiz as any).bonusTime = quiz.bonusTime ?? null;
    }

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    // Students can only access active quizzes
    // Allow access if quiz is active (access code lookup bypasses course check)
    if (user.role === "student") {
      if (!quiz.isActive) {
        return errorResponse("This quiz is not currently active", 403);
      }
      // Note: Course check removed - students with access code can access any active quiz
      // Course validation happens when starting an examination, not when viewing quiz details
    }

    return successResponse(quiz);
  } catch (error: any) {
    console.error("Error fetching quiz:", error);
    return errorResponse(error.message || "Failed to fetch quiz", 500);
  }
}

/**
 * PATCH /api/quizzes/[id]
 * Update quiz by ID (Creator, Teachers, and Admins only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "teacher"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  try {
    // Check if quiz exists and user has permission
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existingQuiz) {
      return errorResponse("Quiz not found", 404);
    }

    // Teachers can only update their own quizzes
    if (user.role === "teacher" && existingQuiz.createdById !== user.id) {
      return errorResponse("Forbidden - You can only update your own quizzes", 403);
    }

    const body = await request.json();
    const {
      title,
      description,
      timeLimit,
      passingScore,
      isActive,
      showResults,
      bonusEnabled,
      bonusTime,
    } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
    if (passingScore !== undefined) updateData.passingScore = passingScore;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (showResults !== undefined) updateData.showResults = showResults;
    if (bonusEnabled !== undefined) updateData.bonusEnabled = bonusEnabled;
    if (bonusTime !== undefined) updateData.bonusTime = bonusTime;

    const updatedQuiz = await prisma.quiz.update({
      where: { id },
      data: updateData,
      include: {
        questions: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return successResponse(updatedQuiz);
  } catch (error: any) {
    console.error("Error updating quiz:", error);
    return errorResponse(error.message || "Failed to update quiz", 500);
  }
}

/**
 * DELETE /api/quizzes/[id]
 * Delete quiz by ID (Creator and Admins only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "teacher"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  try {
    // Check if quiz exists and user has permission
    const existingQuiz = await prisma.quiz.findUnique({
      where: { id },
      select: {
        createdById: true,
        _count: {
          select: {
            examinations: true,
          },
        },
      },
    });

    if (!existingQuiz) {
      return errorResponse("Quiz not found", 404);
    }

    // Teachers can only delete their own quizzes
    if (user.role === "teacher" && existingQuiz.createdById !== user.id) {
      return errorResponse("Forbidden - You can only delete your own quizzes", 403);
    }

    // Warn if quiz has examinations
    if (existingQuiz._count.examinations > 0) {
      return errorResponse(
        "Cannot delete quiz with existing examinations. Consider deactivating instead.",
        400
      );
    }

    await prisma.quiz.delete({
      where: { id },
    });

    return successResponse({ message: "Quiz deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting quiz:", error);
    return errorResponse(error.message || "Failed to delete quiz", 500);
  }
}
