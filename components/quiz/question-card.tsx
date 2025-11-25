"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  points: number;
  order: number;
}

interface AnswerStatus {
  questionId: string;
  answer: string;
  isCorrect: boolean | null;
}

interface QuestionCardProps {
  question: Question;
  answer: string;
  answerStatus?: AnswerStatus;
  isSaving: boolean;
  onAnswerChange: (value: string) => void;
}

export function QuestionCard({
  question,
  answer,
  answerStatus,
  isSaving,
  onAnswerChange,
}: QuestionCardProps) {
  return (
    <Card className="mb-6 overflow-hidden border-2">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl leading-tight">
              {question.text}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {question.points} {question.points === 1 ? "point" : "points"}
              </Badge>
              {question.type === "multiple-choice" && (
                <Badge variant="outline" className="font-normal">
                  Multiple Choice
                </Badge>
              )}
              {question.type === "true-false" && (
                <Badge variant="outline" className="font-normal">
                  True / False
                </Badge>
              )}
            </CardDescription>
          </div>
          {answerStatus && (
            <div className="shrink-0">
              {answerStatus.isCorrect ? (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="size-6" />
                </div>
              ) : answerStatus.isCorrect === false ? (
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <XCircle className="size-6" />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {question.type === "multiple-choice" && (
          <RadioGroup
            value={answer || ""}
            onValueChange={onAnswerChange}
            disabled={isSaving}
            className="space-y-3"
          >
            {question.options.map((option, index) => {
              const optionValue = index.toString();
              const isSelected = answer === optionValue;
              const isCorrect = answerStatus?.isCorrect === true && isSelected;
              const isWrong = answerStatus?.isCorrect === false && isSelected;

              return (
                <div
                  key={index}
                  className={`relative flex cursor-pointer items-center space-x-2 rounded-lg border p-4 transition-all hover:bg-muted/50 ${
                    isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                      : isWrong
                      ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                      : isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : ""
                  }`}
                >
                  <RadioGroupItem value={optionValue} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option}
                  </Label>
                  {isCorrect && (
                    <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                  )}
                  {isWrong && (
                    <XCircle className="size-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              );
            })}
          </RadioGroup>
        )}

        {question.type === "true-false" && (
          <RadioGroup
            value={answer || ""}
            onValueChange={onAnswerChange}
            disabled={isSaving}
            className="grid gap-3 sm:grid-cols-2"
          >
            {["true", "false"].map((value) => {
              const isSelected = answer === value;
              const isCorrect = answerStatus?.isCorrect === true && isSelected;
              const isWrong = answerStatus?.isCorrect === false && isSelected;

              return (
                <div
                  key={value}
                  className={`relative flex cursor-pointer items-center space-x-2 rounded-lg border p-4 transition-all hover:bg-muted/50 ${
                    isCorrect
                      ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                      : isWrong
                      ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                      : isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : ""
                  }`}
                >
                  <RadioGroupItem value={value} id={value} />
                  <Label
                    htmlFor={value}
                    className="flex-1 cursor-pointer font-normal capitalize"
                  >
                    {value}
                  </Label>
                  {isCorrect && (
                    <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                  )}
                  {isWrong && (
                    <XCircle className="size-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              );
            })}
          </RadioGroup>
        )}

        {(question.type === "essay" || question.type === "short-answer") && (
          <div className="space-y-3">
            <Textarea
              placeholder="Type your answer here..."
              value={answer || ""}
              onChange={(e) => onAnswerChange(e.target.value)}
              disabled={isSaving}
              rows={6}
              className={`min-h-[150px] resize-y ${
                answerStatus?.isCorrect === true
                  ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                  : answerStatus?.isCorrect === false
                  ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                  : ""
              }`}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {question.type === "essay"
                  ? "Essay questions are manually reviewed."
                  : "Short answers are auto-graded."}
              </p>
              {answerStatus && (
                <div className="flex items-center gap-2 text-sm">
                  {answerStatus.isCorrect === true ? (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <CheckCircle2 className="size-4" /> Saved
                    </span>
                  ) : answerStatus.isCorrect === false ? (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                      <XCircle className="size-4" /> Saved
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Saved</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {isSaving && (
          <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground animate-pulse">
            <div className="h-2 w-2 rounded-full bg-primary" />
            Saving answer...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
