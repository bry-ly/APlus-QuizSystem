import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/quizzes/code/[code]
 * Get quiz by access code
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const upperCode = code.toUpperCase().trim();

    console.log(`[GET /api/quizzes/code/${code}] Looking up quiz with access code: ${upperCode}`);

    // First, check if quiz exists (regardless of isActive status) for better error messages
    const quizExists = await prisma.quiz.findUnique({
      where: {
        accessCode: upperCode,
      },
      select: {
        id: true,
        title: true,
        isActive: true,
      },
    });

    if (!quizExists) {
      console.log(`[GET /api/quizzes/code/${code}] Quiz not found with access code: ${upperCode}`);
      console.log(`[GET /api/quizzes/code/${code}] Searched for exact match (case-insensitive): ${upperCode}`);
      return errorResponse("Quiz not found with this code", 404);
    }

    if (!quizExists.isActive) {
      console.log(`[GET /api/quizzes/code/${code}] Quiz found but is inactive: "${quizExists.title}" (${quizExists.id})`);
      return errorResponse("This quiz is not currently active", 403);
    }

    // Find quiz by accessCode (exact match only - accessCode is unique)
    const quiz = await prisma.quiz.findFirst({
      where: {
        accessCode: upperCode,
        isActive: true,
      },
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
          },
        },
        questions: {
          select: {
            id: true,
            text: true,
            type: true,
            order: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!quiz) {
      console.log(`[GET /api/quizzes/code/${code}] Quiz not found with access code: ${upperCode} (unexpected error)`);
      return errorResponse("Quiz not found with this code", 404);
    }

    console.log(`[GET /api/quizzes/code/${code}] Found quiz: "${quiz.title}" (${quiz.id}) created at ${quiz.createdAt}`);
    console.log(`[GET /api/quizzes/code/${code}] Quiz has ${quiz.questions.length} questions`);

    return successResponse(quiz);
  } catch (error: any) {
    console.error("Error fetching quiz by code:", error);
    return errorResponse(error.message || "Failed to fetch quiz", 500);
  }
}
