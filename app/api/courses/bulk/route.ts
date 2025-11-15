import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * POST /api/courses/bulk
 * Create multiple courses at once (Admin only)
 * 
 * Request body:
 * {
 *   "courses": [
 *     { "name": "Course Name", "code": "CODE" },
 *     ...
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    const body = await request.json();
    const { courses } = body;

    if (!courses || !Array.isArray(courses)) {
      return errorResponse("courses array is required", 400);
    }

    if (courses.length === 0) {
      return errorResponse("courses array cannot be empty", 400);
    }

    // Validate each course
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      if (!course.name || !course.code) {
        return errorResponse(
          `Course at index ${i} must have 'name' and 'code' fields`,
          400
        );
      }
    }

    // Track results
    const results = {
      created: [] as any[],
      skipped: [] as any[],
      errors: [] as any[],
    };

    // Create each course
    for (const courseData of courses) {
      try {
        // Check if course already exists
        const existing = await prisma.course.findUnique({
          where: { code: courseData.code },
        });

        if (existing) {
          results.skipped.push({
            name: courseData.name,
            code: courseData.code,
            reason: "Course code already exists",
          });
          continue;
        }

        // Create the course
        const newCourse = await prisma.course.create({
          data: {
            id: crypto.randomUUID(),
            name: courseData.name,
            code: courseData.code,
          },
        });

        results.created.push(newCourse);
      } catch (error: any) {
        results.errors.push({
          name: courseData.name,
          code: courseData.code,
          error: error.message,
        });
      }
    }

    return successResponse({
      message: "Bulk creation completed",
      summary: {
        total: courses.length,
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
      },
      details: results,
    });
  } catch (error: any) {
    console.error("Error bulk creating courses:", error);
    return errorResponse(error.message || "Failed to bulk create courses", 500);
  }
}
