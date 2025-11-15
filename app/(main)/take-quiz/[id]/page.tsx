"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { GamifiedProgress } from "@/components/ui/gamified-progress";
import { Clock, ChevronLeft, ChevronRight, Send, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

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

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [examination, setExamination] = useState<Examination | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [answerStatuses, setAnswerStatuses] = useState<Record<string, AnswerStatus>>({});
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
  const saveAnswer = useCallback(async (questionId: string, answer: string) => {
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
                toast.success(`+${bonusAdded}s bonus time! ⏰`, {
                  icon: <Sparkles className="size-4" />,
                });
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
  }, [examination]);

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

        setUser(session.data.user);

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
          const quizResponse = await fetch(`/api/quizzes/${quizId}?includeAnswers=true`);
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
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

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

      const data = await response.json();
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="border-destructive w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => router.push("/dashboard/student")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examination || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No questions available.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{examination.quiz.title}</h1>
          <div className="flex items-center justify-between mb-2">
            <p className="text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            {timeRemaining !== null && (
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Clock className="size-5" />
                <span className={timeRemaining < 60 ? "text-destructive" : ""}>
                  {formatTime(timeRemaining)}
                </span>
                {examination.quiz.bonusEnabled && examination.bonusTimeEarned > 0 && (
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Sparkles className="size-4" />
                    +{examination.bonusTimeEarned}s
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Gamified Progress Bar */}
          <div className="mb-2">
            <GamifiedProgress
              total={questions.length}
              correct={correctCount}
              wrong={wrongCount}
              unanswered={unansweredCount}
            />
          </div>
          
          {/* Question Progress */}
          <Progress value={progress} className="h-1" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl mb-2">
                  {currentQuestion.text}
                </CardTitle>
                <CardDescription>
                  {currentQuestion.points} {currentQuestion.points === 1 ? "point" : "points"}
                </CardDescription>
              </div>
              {currentAnswerStatus && (
                <div className="ml-4">
                  {currentAnswerStatus.isCorrect ? (
                    <CheckCircle2 className="size-6 text-green-600" />
                  ) : currentAnswerStatus.isCorrect === false ? (
                    <XCircle className="size-6 text-red-600" />
                  ) : null}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === "multiple-choice" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                disabled={isSaving}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const optionValue = index.toString();
                    const isSelected = answers[currentQuestion.id] === optionValue;
                    const isCorrect = currentAnswerStatus?.isCorrect === true && isSelected;
                    const isWrong = currentAnswerStatus?.isCorrect === false && isSelected;
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                          isCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                            : isWrong
                            ? "border-red-500 bg-red-50 dark:bg-red-950"
                            : isSelected
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        <RadioGroupItem value={optionValue} id={`option-${index}`} />
                        <Label
                          htmlFor={`option-${index}`}
                          className="flex-1 cursor-pointer"
                        >
                          {option}
                        </Label>
                        {isCorrect && <CheckCircle2 className="size-5 text-green-600" />}
                        {isWrong && <XCircle className="size-5 text-red-600" />}
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === "true-false" && (
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                disabled={isSaving}
              >
                <div className="space-y-3">
                  {["true", "false"].map((value) => {
                    const isSelected = answers[currentQuestion.id] === value;
                    const isCorrect = currentAnswerStatus?.isCorrect === true && isSelected;
                    const isWrong = currentAnswerStatus?.isCorrect === false && isSelected;
                    
                    return (
                      <div
                        key={value}
                        className={`flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                          isCorrect
                            ? "border-green-500 bg-green-50 dark:bg-green-950"
                            : isWrong
                            ? "border-red-500 bg-red-50 dark:bg-red-950"
                            : isSelected
                            ? "border-primary bg-primary/5"
                            : ""
                        }`}
                      >
                        <RadioGroupItem value={value} id={value} />
                        <Label htmlFor={value} className="flex-1 cursor-pointer capitalize">
                          {value}
                        </Label>
                        {isCorrect && <CheckCircle2 className="size-5 text-green-600" />}
                        {isWrong && <XCircle className="size-5 text-red-600" />}
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            )}

            {(currentQuestion.type === "essay" || currentQuestion.type === "short-answer") && (
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  disabled={isSaving}
                  rows={6}
                  className={`min-h-[150px] ${
                    currentAnswerStatus?.isCorrect === true
                      ? "border-green-500 bg-green-50 dark:bg-green-950"
                      : currentAnswerStatus?.isCorrect === false
                      ? "border-red-500 bg-red-50 dark:bg-red-950"
                      : ""
                  }`}
                />
                {currentAnswerStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    {currentAnswerStatus.isCorrect === true ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="size-4" />
                        <span>Answer saved</span>
                      </div>
                    ) : currentAnswerStatus.isCorrect === false ? (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="size-4" />
                        <span>Answer saved (will be reviewed)</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Answer saved</span>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Note: Essay questions will be reviewed manually by your teacher.
                </p>
              </div>
            )}
            
            {isSaving && (
              <p className="text-sm text-muted-foreground mt-2">Saving answer...</p>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>

          <div className="text-sm text-muted-foreground">
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

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-2">
              {questions.map((q, index) => {
                const status = answerStatuses[q.id];
                const hasAnswer = !!answers[q.id];
                
                return (
                  <Button
                    key={q.id}
                    variant={currentQuestionIndex === index ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`relative ${
                      status?.isCorrect === true
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : status?.isCorrect === false
                        ? "border-red-500 bg-red-50 dark:bg-red-950"
                        : hasAnswer
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                        : ""
                    }`}
                  >
                    {index + 1}
                    {status?.isCorrect === true && (
                      <span className="absolute -top-1 -right-1 size-2 bg-green-500 rounded-full"></span>
                    )}
                    {status?.isCorrect === false && (
                      <span className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full"></span>
                    )}
                    {hasAnswer && !status && (
                      <span className="absolute -top-1 -right-1 size-2 bg-yellow-500 rounded-full"></span>
                    )}
                  </Button>
                );
              })}
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-green-500"></span>
                <span>Correct</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-red-500"></span>
                <span>Wrong</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-yellow-500"></span>
                <span>Answered</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
