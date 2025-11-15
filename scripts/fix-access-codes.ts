/**
 * Script to fix existing quizzes with null accessCode
 * Run with: npx tsx scripts/fix-access-codes.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixAccessCodes() {
  try {
    console.log("Finding all quizzes...");
    
    // Get all quizzes and check which ones need accessCode
    const allQuizzes = await prisma.quiz.findMany({
      select: {
        id: true,
        title: true,
        accessCode: true,
      },
    });

    // Filter quizzes with null or missing accessCode
    const quizzesWithoutCode = allQuizzes.filter(q => !q.accessCode);

    console.log(`Found ${quizzesWithoutCode.length} quizzes without accessCode out of ${allQuizzes.length} total`);

    if (quizzesWithoutCode.length === 0) {
      console.log("No quizzes to fix!");
      return;
    }

    // Helper function to generate random alphanumeric string of exact length
    const generateRandomString = (length: number): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    // Update each quiz with a new accessCode
    for (const quiz of quizzesWithoutCode) {
      // Generate exactly 6 random alphanumeric characters
      const randomPart = generateRandomString(6);
      const timePart = (Date.now() % 1000000).toString().padStart(6, '0');
      const extraRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const combinedTime = (timePart.slice(0, 3) + extraRandom).slice(0, 6);
      const accessCode = `${randomPart}-${combinedTime}`;
      
      try {
        await prisma.quiz.update({
          where: { id: quiz.id },
          data: { accessCode },
        });
        console.log(`✓ Fixed quiz "${quiz.title}" (${quiz.id}) with accessCode: ${accessCode}`);
        // Small delay to ensure unique timestamps
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error: any) {
        console.error(`✗ Failed to update quiz "${quiz.title}":`, error.message);
      }
    }

    console.log("\n✅ All quizzes have been updated!");
  } catch (error) {
    console.error("Error fixing access codes:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixAccessCodes();

