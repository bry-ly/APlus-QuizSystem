"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { toast } from "sonner";
import { QuizHeader } from "@/components/quiz/quiz-header";
import { QuestionCard } from "@/components/quiz/question-card";
import { QuestionNavigator } from "@/components/quiz/question-navigator";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  timeLimit: number | null;
  bonusEnabled: boolean;
  bonusTime: number | null;
  questions: Question[];
}

interface Examination {
  id: string;
  quizId: string;
  startedAt: string;
  bonusTimeEarned: number;
  quiz: Quiz;
  answers?: Array<{
    questionId: string;
    answer: string;
    isCorrect: boolean | null;
  }>;
}

interface AnswerStatus {
  questionId: string;
  answer: string;
  isCorrect: boolean | null;
}

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [examination, setExamination] = useState<Examination | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerStatuses, setAnswerStatuses] = useState<
    Record<string, AnswerStatus>
  >({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingAnswer, setSavingAnswer] = useState<string | null>(null);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Save answer in real-time
  const saveAnswer = useCallback(
    async (questionId: string, answer: string) => {
      if (!examination) return;

      setSavingAnswer(questionId);
      try {
        const response = await fetch(`/api/examinations/${examination.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: [{ questionId, answer }],
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save answer");
        }

        const data = await response.json();
        const savedAnswer = data.data.answers?.find(
          (a: any) => a.questionId === questionId
        );

        // Update answer status
        if (savedAnswer) {
          setAnswerStatuses((prev) => ({
            ...prev,
            [questionId]: {
              questionId,
              answer,
              isCorrect: savedAnswer.isCorrect,
            },
          }));

          // Check if bonus time was added
          if (data.data.bonusTimeEarned && examination.quiz.bonusEnabled) {
            const newBonusTime = data.data.bonusTimeEarned;
            const oldBonusTime = examination.bonusTimeEarned || 0;
            const bonusAdded = newBonusTime - oldBonusTime;

            if (bonusAdded > 0 && savedAnswer.isCorrect) {
              setTimeRemaining((prev) => {
                if (prev !== null) {
                  const newTime = prev + bonusAdded;
                  toast.success(`+${bonusAdded}s bonus time! ⏰`);
                  return newTime;
                }
                return prev;
              });
            }
          }

          // Update examination with new bonus time
          setExamination((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              bonusTimeEarned: data.data.bonusTimeEarned || 0,
            };
          });
        }
      } catch (err: any) {
        console.error("Error saving answer:", err);
        toast.error("Failed to save answer");
      } finally {
        setSavingAnswer(null);
      }
    },
    [examination]
  );

  useEffect(() => {
    const initQuiz = async () => {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push("/login");
          return;
        }

        if ((session.data.user as any).role !== "student") {
          router.push("/");
          return;
        }

        // Start or get existing examination
        const examResponse = await fetch("/api/examinations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId }),
        });

        if (!examResponse.ok) {
          const errorData = await examResponse.json();
          throw new Error(errorData.error || "Failed to start quiz");
        }

        const examData = await examResponse.json();
        const exam = examData.data;

        // Use quiz data from examination if available, otherwise fetch separately
        let quiz = exam.quiz;

        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
          // Fetch quiz with questions if not included in examination
          const quizResponse = await fetch(
            `/api/quizzes/${quizId}?includeAnswers=true`
          );
          if (!quizResponse.ok) {
            const errorData = await quizResponse.json();
            throw new Error(errorData.error || "Failed to load quiz");
          }

          const quizData = await quizResponse.json();
          quiz = quizData.data;
        }

        if (!quiz || !quiz.questions || quiz.questions.length === 0) {
          throw new Error("This quiz has no questions");
        }

        // Ensure bonusEnabled and bonusTime are set
        if (quiz.bonusEnabled === undefined) quiz.bonusEnabled = false;
        if (quiz.bonusTime === undefined) quiz.bonusTime = null;

        // Randomize questions
        const shuffledQuestions = shuffleArray(quiz.questions) as Question[];

        // Load existing answers if any
        const examDetailsResponse = await fetch(`/api/examinations/${exam.id}`);
        if (examDetailsResponse.ok) {
          const examDetails = await examDetailsResponse.json();
          const existingAnswers = examDetails.data.answers || [];

          const answersMap: Record<string, string> = {};
          const statusesMap: Record<string, AnswerStatus> = {};

          existingAnswers.forEach((ans: any) => {
            answersMap[ans.questionId] = ans.answer;
            statusesMap[ans.questionId] = {
              questionId: ans.questionId,
              answer: ans.answer,
              isCorrect: ans.isCorrect,
            };
          });

          setAnswers(answersMap);
          setAnswerStatuses(statusesMap);
        }

        // Set examination with complete quiz data
        setExamination({
          ...exam,
          quiz: { ...quiz, questions: shuffledQuestions },
          bonusTimeEarned: exam.bonusTimeEarned || 0,
        });
        setQuestions(shuffledQuestions);

        // Initialize timer if there's a time limit
        if (quiz.timeLimit) {
          const startTime = new Date(exam.startedAt).getTime();
          const limitMs = quiz.timeLimit * 60 * 1000;
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, Math.floor((limitMs - elapsed) / 1000));
          setTimeRemaining(remaining);
        }
      } catch (err: any) {
        console.error("Error initializing quiz:", err);
        setError(err.message || "Failed to load quiz");
      } finally {
        setLoading(false);
      }
    };

    initQuiz();
  }, [quizId, router]);

  const handleAnswerChange = async (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
    await saveAnswer(questionId, answer);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (submitting || !examination) return;

    setSubmitting(true);
    try {
      // Prepare answers in the format expected by API
      const formattedAnswers = Object.entries(answers).map(
        ([questionId, answer]) => ({
          questionId,
          answer,
        })
      );

      const response = await fetch(`/api/examinations/${examination.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: formattedAnswers,
          complete: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit quiz");
      }

      router.push(`/results/${examination.id}`);
    } catch (err: any) {
      console.error("Error submitting quiz:", err);
      setError(err.message || "Failed to submit quiz");
      setSubmitting(false);
    }
  }, [submitting, examination, answers, router]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timeRemaining === 0 && !submitting && examination) {
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, submitting, handleSubmit, examination]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={() => router.push("/dashboard/student")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examination || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No questions available.</p>
            <Button
              className="mt-4"
              onClick={() => router.push("/dashboard/student")}
            >
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;

  // Calculate correct and wrong answers for gamified progress
  const correctCount = Object.values(answerStatuses).filter(
    (status) => status.isCorrect === true
  ).length;
  const wrongCount = Object.values(answerStatuses).filter(
    (status) => status.isCorrect === false
  ).length;
  const unansweredCount = questions.length - answeredCount;

  const currentAnswerStatus = answerStatuses[currentQuestion.id];
  const isSaving = savingAnswer === currentQuestion.id;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <QuizHeader
          title={examination.quiz.title}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={questions.length}
          timeRemaining={timeRemaining}
          bonusTimeEarned={examination.bonusTimeEarned}
          bonusEnabled={examination.quiz.bonusEnabled}
          correctCount={correctCount}
          wrongCount={wrongCount}
          unansweredCount={unansweredCount}
        />

        <QuestionCard
          question={currentQuestion}
          answer={answers[currentQuestion.id]}
          answerStatus={currentAnswerStatus}
          isSaving={isSaving}
          onAnswerChange={(value) =>
            handleAnswerChange(currentQuestion.id, value)
          }
        />

        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <div className="text-sm font-medium text-muted-foreground">
            {answeredCount} of {questions.length} answered
          </div>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext} className="gap-2">
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="size-4" />
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>

        <QuestionNavigator
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          answerStatuses={answerStatuses}
          onNavigate={setCurrentQuestionIndex}
        />
      </div>
    </div>
  );
}
