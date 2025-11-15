/**
 * Standard courses list for the quiz system
 * Format: "Course Name - Department Code"
 */
export const COURSES_DATA = [
  "B.S. in Criminology - CJE",
  "B.S. in Information Technology - ECT",
  "B.S. in Computer Science - ECT",
  "B.S. in Electronics Engineering - ECT",
  "B.S. in Computer Engineering - ECT",
  "B.S. in Tourism Management - BHT",
  "B.S. in Hospitality Management - BHT",
  "B.S. in Bus. Ad. Major in Financial Management - BHT",
  "B.S. in Bus. Ad. Major in Marketing Management - BHT",
  "Bachelor of Elem. Ed. - EDUC",
  "Bachelor of Sec. Ed. Major in English - EDUC",
  "Bachelor of Sec. Ed. Major in Mathematics - EDUC",
  "Bachelor of Sec. Ed. Major in Social Studies - EDUC",
  "Grade 11 - Senior High School",
  "Grade 12 - Senior High School",
];

/**
 * Parse course string to extract name and code
 * @param courseString - Format: "Course Name - CODE"
 * @returns { name, code } or null if invalid format
 */
export function parseCourseString(courseString: string): {
  name: string;
  code: string;
} | null {
  const parts = courseString.split(" - ");
  if (parts.length !== 2) return null;

  const name = parts[0].trim();
  const code = parts[1].trim();

  return { name, code };
}

/**
 * Parse all courses from the COURSES_DATA array
 * @returns Array of { name, code } objects
 */
export function parseAllCourses(): Array<{ name: string; code: string }> {
  return COURSES_DATA.map((courseString) => {
    const parsed = parseCourseString(courseString);
    if (!parsed) {
      throw new Error(`Invalid course format: ${courseString}`);
    }
    return parsed;
  }).filter(Boolean);
}
