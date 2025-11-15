import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireRole,
  successResponse,
  errorResponse,
} from "@/lib/api-middleware";

/**
 * GET /api/results/[id]/pdf
 * Generate PDF for examination results
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireRole(request, ["admin", "teacher", "student"]);

  if (authResult instanceof Response) {
    return authResult;
  }

  const { user } = authResult;
  const { id } = await params;

  try {
    const examination = await prisma.examination.findUnique({
      where: { id },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        answers: {
          select: {
            id: true,
            questionId: true,
            answer: true,
            isCorrect: true,
            pointsEarned: true,
          },
        },
      },
    });

    if (!examination) {
      return errorResponse("Examination not found", 404);
    }

    // Students can only view their own examinations
    if (user.role === "student" && examination.studentId !== user.id) {
      return errorResponse("Forbidden - You can only view your own examinations", 403);
    }

    // Teachers can only view examinations for their quizzes
    if (user.role === "teacher" && examination.quiz.createdById !== user.id) {
      return errorResponse(
        "Forbidden - You can only view examinations for your quizzes",
        403
      );
    }

    // Generate HTML content for PDF
    const maxScore = examination.quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const correctCount = examination.answers.filter((a) => a.isCorrect).length;
    const studentName = `${examination.student.firstName} ${examination.student.lastName}`;
    const completedDate = examination.completedAt
      ? new Date(examination.completedAt).toLocaleDateString()
      : "N/A";
    const timeSpent = examination.timeSpent
      ? `${Math.floor(examination.timeSpent / 60)}m ${examination.timeSpent % 60}s`
      : "N/A";

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Quiz Results - ${examination.quiz.title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
      color: #333;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
    }
    .header h1 {
      margin: 0;
      color: #1a1a1a;
    }
    .info-section {
      margin-bottom: 30px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      padding: 10px;
      background: #f5f5f5;
      border-radius: 5px;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-value {
      font-size: 18px;
      margin-top: 5px;
    }
    .score-section {
      text-align: center;
      padding: 20px;
      background: ${examination.passed ? "#d4edda" : "#f8d7da"};
      border: 2px solid ${examination.passed ? "#28a745" : "#dc3545"};
      border-radius: 10px;
      margin-bottom: 30px;
    }
    .score-section h2 {
      margin: 0 0 10px 0;
      color: ${examination.passed ? "#155724" : "#721c24"};
    }
    .score-value {
      font-size: 48px;
      font-weight: bold;
      color: ${examination.passed ? "#28a745" : "#dc3545"};
    }
    .questions-section {
      margin-top: 30px;
    }
    .question-item {
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 5px;
      background: #fff;
    }
    .question-item.correct {
      border-color: #28a745;
      background: #d4edda;
    }
    .question-item.incorrect {
      border-color: #dc3545;
      background: #f8d7da;
    }
    .question-number {
      font-weight: bold;
      margin-bottom: 10px;
    }
    .question-text {
      margin-bottom: 10px;
      font-size: 14px;
    }
    .answer-detail {
      font-size: 12px;
      margin-top: 5px;
    }
    .correct-answer {
      color: #28a745;
      font-weight: bold;
    }
    .wrong-answer {
      color: #dc3545;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Quiz Results</h1>
    <h2>${examination.quiz.title}</h2>
  </div>

  <div class="info-section">
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Student Name</div>
        <div class="info-value">${studentName}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Completed Date</div>
        <div class="info-value">${completedDate}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Time Spent</div>
        <div class="info-value">${timeSpent}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Correct Answers</div>
        <div class="info-value">${correctCount} / ${examination.quiz.questions.length}</div>
      </div>
    </div>
  </div>

  <div class="score-section">
    <h2>${examination.passed ? "PASSED" : "NOT PASSED"}</h2>
    <div class="score-value">${examination.percentage?.toFixed(1)}%</div>
    <div style="margin-top: 10px; font-size: 16px;">
      Score: ${examination.score?.toFixed(1)} / ${maxScore} points
    </div>
    <div style="margin-top: 5px; font-size: 14px; color: #666;">
      Passing Score: ${examination.quiz.passingScore}%
    </div>
  </div>

  <div class="questions-section">
    <h3>Question Review</h3>
    ${examination.quiz.questions
      .map((question, index) => {
        const answer = examination.answers.find((a) => a.questionId === question.id);
        const isCorrect = answer?.isCorrect;
        const answerText =
          question.type === "multiple-choice"
            ? question.options[parseInt(answer?.answer || "0")]
            : answer?.answer || "Not answered";
        const correctAnswerText =
          question.type === "multiple-choice"
            ? question.options[parseInt(question.correctAnswer)]
            : question.correctAnswer;

        return `
          <div class="question-item ${isCorrect ? "correct" : "incorrect"}">
            <div class="question-number">Question ${index + 1} ${isCorrect ? "✓" : "✗"}</div>
            <div class="question-text">${question.text}</div>
            <div class="answer-detail">
              <div>Your answer: <span class="${isCorrect ? "correct-answer" : "wrong-answer"}">${answerText}</span></div>
              <div>Correct answer: <span class="correct-answer">${correctAnswerText}</span></div>
              <div>Points: ${answer?.pointsEarned || 0} / ${question.points}</div>
            </div>
          </div>
        `;
      })
      .join("")}
  </div>

  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p>Quiz and Exam System</p>
  </div>
</body>
</html>
    `;

    // Return HTML that can be converted to PDF on the client side
    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="quiz-result-${id}.html"`,
      },
    });
  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return errorResponse(error.message || "Failed to generate PDF", 500);
  }
}


