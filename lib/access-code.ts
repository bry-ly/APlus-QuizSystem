import { prisma } from "@/lib/prisma";

/**
 * Generates a random alphanumeric string of a given length.
 */
const generateRandomString = (length: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates a unique access code for a quiz.
 * Format: XXXXXX-XXXXXX (6 random chars - 6 time/random digits)
 * Optimized to check uniqueness in batches to reduce database calls
 */
export async function generateUniqueAccessCode(
  maxAttempts = 10
): Promise<string | null> {
  // Generate multiple candidates at once to reduce database round trips
  const candidates: string[] = [];
  
  for (let i = 0; i < maxAttempts; i++) {
    // Generate exactly 6 random alphanumeric characters
    const randomPart = generateRandomString(6);

    // Use timestamp + random for uniqueness
    const timePart = (Date.now() % 1000000).toString().padStart(6, "0");
    const extraRandom = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    const combinedTime = (timePart.slice(0, 3) + extraRandom).slice(0, 6);
    const accessCode = `${randomPart}-${combinedTime}`;
    
    candidates.push(accessCode);
  }

  // Early return if no candidates (should not happen with maxAttempts > 0)
  if (candidates.length === 0) {
    console.log("[generateUniqueAccessCode] No candidates generated");
    return null;
  }

  // Check all candidates in a single database query
  const existing = await prisma.quiz.findMany({
    where: { 
      accessCode: { 
        in: candidates 
      } 
    },
    select: { accessCode: true },
  });

  const existingCodes = new Set(existing.map(q => q.accessCode));
  
  // Return the first candidate that doesn't exist
  for (const candidate of candidates) {
    if (!existingCodes.has(candidate)) {
      return candidate;
    }
  }

  console.log(
    `[generateUniqueAccessCode] Failed to generate unique code after ${maxAttempts} attempts`
  );
  return null;
}
