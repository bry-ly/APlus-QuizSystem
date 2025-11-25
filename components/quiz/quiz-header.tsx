"use client";

import { Clock, Sparkles } from "lucide-react";
import { GamifiedProgress } from "@/components/ui/gamified-progress";
import { Progress } from "@/components/ui/progress";

interface QuizHeaderProps {
  title: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timeRemaining: number | null;
  bonusTimeEarned: number;
  bonusEnabled: boolean;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
}

export function QuizHeader({
  title,
  currentQuestionIndex,
  totalQuestions,
  timeRemaining,
  bonusTimeEarned,
  bonusEnabled,
  correctCount,
  wrongCount,
  unansweredCount,
}: QuizHeaderProps) {
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
        </div>

        {timeRemaining !== null && (
          <div className="flex items-center gap-3 rounded-lg border bg-card p-2 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="size-5 text-muted-foreground" />
              <span
                className={
                  timeRemaining < 60 ? "text-destructive animate-pulse" : ""
                }
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
            {bonusEnabled && bonusTimeEarned > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-sm font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Sparkles className="size-3" />+{bonusTimeEarned}s
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <GamifiedProgress
          total={totalQuestions}
          correct={correctCount}
          wrong={wrongCount}
          unanswered={unansweredCount}
        />
        <Progress value={progress} className="h-1" />
      </div>
    </div>
  );
}
