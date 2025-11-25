"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Examination } from "@/hooks/use-results";

interface ResultsChartsProps {
  completedResults: Examination[];
}

export function ResultsCharts({ completedResults }: ResultsChartsProps) {
  if (completedResults.length === 0) return null;

  const chartData = completedResults.map((r) => ({
    name: r.quiz.title.substring(0, 10),
    score: r.percentage,
    fullName: r.quiz.title,
  }));

  const passFailData = [
    {
      name: "Passed",
      value: completedResults.filter((r) => r.passed).length,
    },
    {
      name: "Failed",
      value: completedResults.filter((r) => !r.passed).length,
    },
  ];

  const COLORS = ["#10b981", "#ef4444"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Score Trends</CardTitle>
          <CardDescription>Your performance across quizzes</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pass/Fail Distribution</CardTitle>
          <CardDescription>Quiz completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={passFailData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  value > 0 ? `${name}: ${value}` : ""
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {passFailData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
