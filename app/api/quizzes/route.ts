import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
  validateRequiredFields,
} from "@/lib/api-middleware";

/**
 * GET /api/quizzes
 * Get all quizzes (filtered by role and access)
 */
export async function GET(request: NextRequest) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

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

    console.log(`[GET /api/quizzes] Found ${quizzes.length} quizzes for user ${user.id} (${user.role})`);
    if (quizzes.length > 0) {
      console.log(`[GET /api/quizzes] Most recent quiz: "${quizzes[0].title}" (${quizzes[0].id}) created at ${quizzes[0].createdAt}`);
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
    const validationError = validateRequiredFields(body, [
      "title",
      "courseId",
    ]);

    if (validationError) {
      return errorResponse(validationError, 400);
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
    } = body;

    // Validate course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return errorResponse("Course not found", 404);
    }

    // Generate unique access code with better uniqueness
    // Format: XXXXXX-XXXXXX (6 random chars - 6 time digits)
    let accessCode: string = "";
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Helper function to generate random alphanumeric string of exact length
    const generateRandomString = (length: number): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Ensure access code is unique
    while (!isUnique && attempts < maxAttempts) {
      // Generate exactly 6 random alphanumeric characters
      const randomPart = generateRandomString(6);
      
      // Use timestamp for uniqueness
      const timePart = (Date.now() % 1000000).toString().padStart(6, '0'); // Last 6 digits of timestamp
      // Add a small random component to ensure uniqueness even in same millisecond
      const extraRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const combinedTime = (timePart.slice(0, 3) + extraRandom).slice(0, 6);
      accessCode = `${randomPart}-${combinedTime}`;

      // Check if this access code already exists
      const existing = await prisma.quiz.findUnique({
        where: { accessCode },
        select: { id: true },
      });

      if (!existing) {
        isUnique = true;
      } else {
        attempts++;
        console.log(`[POST /api/quizzes] Access code collision, generating new one (attempt ${attempts})`);
        // Small delay to ensure different timestamp
        await new Promise(resolve => setTimeout(resolve, 1));
      }
    }

    if (!isUnique || !accessCode) {
      return errorResponse("Failed to generate unique access code. Please try again.", 500);
    }

    console.log(`[POST /api/quizzes] Generated unique access code: ${accessCode}`);

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
        questions: questions && questions.length > 0
          ? {
              create: questions.map((q: any, index: number) => {
                // Validate question data
                if (!q.text || !q.text.trim()) {
                  throw new Error(`Question ${index + 1} must have text`);
                }

                // Ensure correctAnswer is a string
                let correctAnswer = q.correctAnswer?.toString() || "";
                
                // For true/false, ensure it's "true" or "false"
                if (q.type === "true-false") {
                  if (correctAnswer === "0" || correctAnswer === "false") {
                    correctAnswer = "false";
                  } else {
                    correctAnswer = "true";
                  }
                }

                // For multiple-choice, ensure it's a valid index
                if (q.type === "multiple-choice") {
                  if (!q.options || q.options.length === 0) {
                    throw new Error(`Question ${index + 1} must have options`);
                  }
                  const answerIndex = parseInt(correctAnswer);
                  if (isNaN(answerIndex) || answerIndex < 0 || answerIndex >= q.options.length) {
                    throw new Error(`Question ${index + 1} has invalid correct answer index`);
                  }
                }

                return {
                  id: crypto.randomUUID(),
                  text: q.text.trim(),
                  type: q.type || "multiple-choice",
                  options: q.options || [],
                  correctAnswer: correctAnswer,
                  points: q.points || 1,
                  order: index,
                };
              }),
            }
          : undefined,
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

    console.log(`[POST /api/quizzes] Created quiz: "${newQuiz.title}" (${newQuiz.id}) with accessCode: ${newQuiz.accessCode}`);
    console.log(`[POST /api/quizzes] Quiz has ${newQuiz.questions.length} questions`);

    return successResponse(newQuiz, 201);
  } catch (error: any) {
    console.error("Error creating quiz:", error);
    return errorResponse(error.message || "Failed to create quiz", 500);
  }
}
