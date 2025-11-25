import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";
import { quizSchema } from "@/lib/validators/quiz";
import { generateUniqueAccessCode } from "@/lib/access-code";

/**
 * GET /api/quizzes
 * Get all quizzes (filtered by role and access)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, [
    "admin",
    "teacher",
    "student",
  ]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get("courseId");

  try {
    const whereClause: any = {};

    // Students can only see active quizzes in their course
    if (user.role === "student") {
      whereClause.isActive = true;
      whereClause.courseId = user.courseId;
    }

    // Teachers can see quizzes they created or in their department's courses
    if (user.role === "teacher") {
      whereClause.createdById = user.id;
    }

    // Filter by courseId if provided
    if (courseId) {
      whereClause.courseId = courseId;
    }

    const quizzes = await prisma.quiz.findMany({
      where: whereClause,
      include: {
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
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            examinations: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(
      `[GET /api/quizzes] Found ${quizzes.length} quizzes for user ${user.id} (${user.role})`
    );
    if (quizzes.length > 0) {
      console.log(
        `[GET /api/quizzes] Most recent quiz: "${quizzes[0].title}" (${quizzes[0].id}) created at ${quizzes[0].createdAt}`
      );
    }

    return successResponse(quizzes);
  } catch (error: any) {
    console.error("Error fetching quizzes:", error);
    return errorResponse(error.message || "Failed to fetch quizzes", 500);
  }
}

/**
 * POST /api/quizzes
 * Create a new quiz (Teachers and Admins only)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "teacher"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;

  try {
    const body = await request.json();

    // Validate request body using Zod schema
    const validationResult = quizSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = (validationResult.error as any).errors
        .map((e: any) => e.message)
        .join(", ");
      return errorResponse(errorMessage, 400);
    }

    const {
      title,
      description,
      courseId,
      timeLimit,
      passingScore,
      showResults,
      bonusEnabled,
      bonusTime,
      questions,
    } = validationResult.data;

    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    // Generate unique access code
    const accessCode = await generateUniqueAccessCode();

    if (!accessCode) {
      return errorResponse(
        "Failed to generate unique access code. Please try again.",
        500
      );
    }

    console.log(
      `[POST /api/quizzes] Generated unique access code: ${accessCode}`
    );

    // Create quiz with questions
    const newQuiz = await prisma.quiz.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description,
        courseId,
        createdById: user.id,
        accessCode,
        timeLimit: timeLimit || null,
        passingScore: passingScore || 50,
        showResults: showResults !== undefined ? showResults : true,
        bonusEnabled: bonusEnabled || false,
        bonusTime: bonusEnabled ? bonusTime : null,
        questions: {
          create: questions.map((q, index) => ({
            id: crypto.randomUUID(),
            text: q.text,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer.toString(),
            points: q.points,
            order: index,
          })),
        },
      },
      include: {
        questions: {
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
    });

    console.log(
      `[POST /api/quizzes] Created quiz: "${newQuiz.title}" (${newQuiz.id}) with accessCode: ${newQuiz.accessCode}`
    );
    console.log(
      `[POST /api/quizzes] Quiz has ${newQuiz.questions.length} questions`
    );

    return successResponse(newQuiz, 201);
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    return errorResponse(error.message || "Failed to create quiz", 500);
  }
}
