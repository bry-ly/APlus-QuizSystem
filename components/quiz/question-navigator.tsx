"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Circle, HelpCircle, XCircle } from "lucide-react";

interface Question {
  id: string;
}

interface AnswerStatus {
  questionId: string;
  isCorrect: boolean | null;
}

interface QuestionNavigatorProps {
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  answerStatuses: Record<string, AnswerStatus>;
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({
  questions,
  currentQuestionIndex,
  answers,
  answerStatuses,
  onNavigate,
}: QuestionNavigatorProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">
          Question Navigator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {questions.map((q, index) => {
            const status = answerStatuses[q.id];
            const hasAnswer = !!answers[q.id];
            const isCurrent = currentQuestionIndex === index;

            let variant: "default" | "outline" | "secondary" | "ghost" =
              "outline";
            let className = "relative h-10 w-full p-0 font-medium";

            if (isCurrent) {
              variant = "default";
            } else if (status?.isCorrect === true) {
              className +=
                " border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400";
            } else if (status?.isCorrect === false) {
              className +=
                " border-red-500 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400";
            } else if (hasAnswer) {
              className +=
                " border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400";
            }

            return (
              <Button
                key={q.id}
                variant={variant}
                onClick={() => onNavigate(index)}
                className={className}
              >
                {index + 1}
                {status?.isCorrect === true && (
                  <span className="absolute -right-1 -top-1 flex size-3 items-center justify-center rounded-full bg-green-500 ring-2 ring-background">
                    <CheckCircle2 className="size-2 text-white" />
                  </span>
                )}
                {status?.isCorrect === false && (
                  <span className="absolute -right-1 -top-1 flex size-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-background">
                    <XCircle className="size-2 text-white" />
                  </span>
                )}
              </Button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="flex size-4 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <CheckCircle2 className="size-3" />
            </div>
            <span>Correct</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex size-4 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              <XCircle className="size-3" />
            </div>
            <span>Wrong</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex size-4 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
              <Circle className="size-3 fill-current" />
            </div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex size-4 items-center justify-center rounded-full border bg-background">
              <span className="text-[10px]">1</span>
            </div>
            <span>Current</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders when navigating between questions
export default memo(QuestionNavigator);
