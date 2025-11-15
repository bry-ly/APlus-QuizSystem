import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/examinations
 * Get examinations (filtered by role)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { searchParams } = new URL(request.url);
  const quizId = searchParams.get("quizId");
  const studentId = searchParams.get("studentId");

  try {
    const whereClause: any = {};

    // Students can only see their own examinations
    if (user.role === "student") {
      whereClause.studentId = user.id;
    }

    // Teachers can see examinations for their quizzes
    if (user.role === "teacher") {
      whereClause.quiz = {
        createdById: user.id,
      };
    }

    if (quizId) {
      whereClause.quizId = quizId;
    }

    if (studentId && user.role !== "student") {
      whereClause.studentId = studentId;
    }

    const examinations = await prisma.examination.findMany({
      where: whereClause,
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            timeLimit: true,
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
        _count: {
          select: {
            answers: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return successResponse(examinations);
  } catch (error: any) {
    console.error("Error fetching examinations:", error);
    return errorResponse(error.message || "Failed to fetch examinations", 500);
  }
}

/**
 * POST /api/examinations
 * Create a new examination (start a quiz) - Students only
 */
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();
    const { quizId } = body;

    if (!quizId) {
      return errorResponse("Quiz ID is required", 400);
    }

    // Verify quiz exists and is active
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        isActive: true,
        courseId: true,
        timeLimit: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    if (!quiz.isActive) {
      return errorResponse("This quiz is not currently active", 403);
    }

    if (quiz._count.questions === 0) {
      return errorResponse("This quiz has no questions", 400);
    }

    // Note: Course check removed to allow access code-based access
    // Students with access codes can take quizzes from any course
    // Course validation is handled at the quiz detail view level if needed

    // Check if student already has an examination for this quiz
    const existingExamination = await prisma.examination.findFirst({
      where: {
        quizId,
        studentId: user.id,
      },
    });

    if (existingExamination) {
      // If already completed, don't allow retake
      if (existingExamination.completedAt) {
        return errorResponse("You have already completed this quiz", 403);
      }
      // If started but not completed, return existing examination with full quiz data
      const examWithQuiz = await prisma.examination.findUnique({
        where: { id: existingExamination.id },
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
        },
      });
      return successResponse(examWithQuiz);
    }

    // Generate unique token code
    const tokenCode = `${crypto.randomUUID().split("-")[0]}-${Date.now()}`;

    // Create new examination
    const newExamination = await prisma.examination.create({
      data: {
        id: crypto.randomUUID(),
        quizId,
        studentId: user.id,
        tokenCode,
        startedAt: new Date(),
      },
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
      },
    });

    return successResponse(newExamination, 201);
  } catch (error: any) {
    console.error("Error creating examination:", error);
    return errorResponse(error.message || "Failed to start examination", 500);
  }
}
