"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GamifiedProgressProps {
  total: number;
  correct: number;
  wrong: number;
  unanswered?: number;
  className?: string;
}

export function GamifiedProgress({
  total,
  correct,
  wrong,
  unanswered = 0,
  className,
}: GamifiedProgressProps) {
  const correctPercentage = total > 0 ? (correct / total) * 100 : 0;
  const wrongPercentage = total > 0 ? (wrong / total) * 100 : 0;
  const unansweredPercentage = total > 0 ? (unanswered / total) * 100 : 0;

  return (
    <div
      data-slot="gamified-progress"
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
    >
      {/* Correct answers - Green section */}
      {correctPercentage > 0 && (
        <div
          className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-300 ease-in-out"
          style={{ width: `${correctPercentage}%` }}
        />
      )}

      {/* Wrong answers - Red section */}
      {wrongPercentage > 0 && (
        <div
          className="absolute h-full bg-red-500 transition-all duration-300 ease-in-out"
          style={{
            left: `${correctPercentage}%`,
            width: `${wrongPercentage}%`,
          }}
        />
      )}

      {/* Unanswered - Gray section */}
      {unansweredPercentage > 0 && (
        <div
          className="absolute h-full bg-muted-foreground/30 transition-all duration-300 ease-in-out"
          style={{
            left: `${correctPercentage + wrongPercentage}%`,
            width: `${unansweredPercentage}%`,
          }}
        />
      )}

      {/* Labels */}
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground/80">
        {correct > 0 || wrong > 0 ? (
          <span>
            ✓ {correct} / ✗ {wrong}
          </span>
        ) : (
          <span className="text-muted-foreground">No answers yet</span>
        )}
      </div>
    </div>
  );
}


