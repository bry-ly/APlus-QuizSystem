import { z } from "zod";

export const questionSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Question text is required"),
  type: z.enum(["multiple-choice", "true-false", "short-answer", "essay"]),
  options: z.array(z.string()).optional(),
  correctAnswer: z.union([z.string(), z.number()]).refine((val) => val !== undefined && val !== null && val !== "", {
    message: "Correct answer is required",
  }),
  points: z.number().min(1, "Points must be at least 1"),
  order: z.number().optional(),
}).refine((data) => {
  if (data.type === "multiple-choice") {
    if (!data.options || data.options.length < 2) {
      return false;
    }
    const emptyOptions = data.options.filter((opt) => !opt || !opt.trim());
    if (emptyOptions.length > 0) {
      return false;
    }
  }
  return true;
}, {
  message: "Multiple choice questions must have at least 2 valid options",
  path: ["options"],
});

export const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  courseId: z.string().min(1, "Course is required"),
  timeLimit: z.number().nullable().optional(),
  passingScore: z.number().min(0).max(100).default(50),
  showResults: z.boolean().default(true),
  bonusEnabled: z.boolean().default(false),
  bonusTime: z.number().nullable().optional(),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
});

export type QuestionInput = z.infer<typeof questionSchema>;
export type QuizInput = z.infer<typeof quizSchema>;
