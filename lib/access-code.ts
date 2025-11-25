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
 */
export async function generateUniqueAccessCode(
  maxAttempts = 10
): Promise<string | null> {
  let accessCode = "";
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < maxAttempts) {
    // Generate exactly 6 random alphanumeric characters
    const randomPart = generateRandomString(6);

    // Use timestamp for uniqueness
    const timePart = (Date.now() % 1000000).toString().padStart(6, "0"); // Last 6 digits of timestamp

    // Add a small random component to ensure uniqueness even in same millisecond
    const extraRandom = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

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
      console.log(
        `[generateUniqueAccessCode] Access code collision, generating new one (attempt ${attempts})`
      );
      // Small delay to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 1));
    }
  }

  return isUnique ? accessCode : null;
}
