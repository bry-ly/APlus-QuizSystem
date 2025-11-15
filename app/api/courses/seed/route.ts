import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";
import { parseAllCourses } from "@/lib/courses-data";

/**
 * POST /api/courses/seed
 * Seed the database with predefined courses (Admin only)
 * This will create all courses from the COURSES_DATA array
 */
export async function POST(request: NextRequest) {
  const authResult = await requireRole(request, ["admin"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  try {
    // Parse all courses from the data file
    const coursesToCreate = parseAllCourses();

    // Track results
    const results = {
      created: [] as string[],
      skipped: [] as string[],
      errors: [] as string[],
    };

    // Create each course
    for (const courseData of coursesToCreate) {
      try {
        // Check if course already exists
        const existing = await prisma.course.findUnique({
          where: { code: courseData.code },
        });

        if (existing) {
          results.skipped.push(`${courseData.name} (${courseData.code})`);
          continue;
        }

        // Create the course
        await prisma.course.create({
          data: {
            id: crypto.randomUUID(),
            name: courseData.name,
            code: courseData.code,
          },
        });

        results.created.push(`${courseData.name} (${courseData.code})`);
      } catch (error: any) {
        results.errors.push(
          `${courseData.name} (${courseData.code}): ${error.message}`
        );
      }
    }

    return successResponse({
      message: "Seed operation completed",
      summary: {
        total: coursesToCreate.length,
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length,
      },
      details: results,
    });
  } catch (error: any) {
    console.error("Error seeding courses:", error);
    return errorResponse(error.message || "Failed to seed courses", 500);
  }
}
