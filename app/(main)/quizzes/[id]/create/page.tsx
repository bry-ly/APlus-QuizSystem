"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Navbar } from "@/components/landing/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  text: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options?: string[];
  correctAnswer?: string | number;
  points: number;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("");
  const [timeLimit, setTimeLimit] = useState("30");
  const [passingScore, setPassingScore] = useState("70");
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          if ((session.data.user as any).role !== "teacher") {
            router.push("/");
          }
          setUser(session.data.user);
        } else {
          router.push("/login");
        }
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(),
      text: "",
      type: "multiple-choice",
      options: ["", "", "", ""],
      correctAnswer: 0,
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("Please enter a quiz title");
      return;
    }
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }
    // Save quiz logic here
    router.push("/main/quizzes");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/main/quizzes">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="size-4" />
              Back to Quizzes
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create New Quiz</h1>
          <p className="text-muted-foreground">
            Set up your quiz details and add questions
          </p>
        </div>

        {/* Quiz Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
            <CardDescription>Configure your quiz settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Mathematics Basics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this quiz covers..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  min="0"
                  max="100"
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  Add questions to your quiz ({questions.length} added)
                </CardDescription>
              </div>
              <Button onClick={addQuestion} className="gap-2">
                <Plus className="size-4" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No questions added yet
                </p>
                <Button
                  onClick={addQuestion}
                  variant="outline"
                  className="gap-2 bg-transparent"
                >
                  <Plus className="size-4" />
                  Add First Question
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="p-4 border rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">Question {index + 1}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div>
                      <Label>Question Text *</Label>
                      <Textarea
                        placeholder="Enter your question..."
                        value={question.text}
                        onChange={(e) =>
                          updateQuestion(question.id, { text: e.target.value })
                        }
                        className="mt-2"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Question Type</Label>
                        <select
                          value={question.type}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              type: e.target.value as Question["type"],
                            })
                          }
                          className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
                        >
                          <option value="multiple-choice">
                            Multiple Choice
                          </option>
                          <option value="true-false">True/False</option>
                          <option value="short-answer">Short Answer</option>
                        </select>
                      </div>

                      <div>
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              points: Number.parseInt(e.target.value),
                            })
                          }
                          className="mt-2"
                        />
                      </div>
                    </div>

                    {question.type === "multiple-choice" &&
                      question.options && (
                        <div>
                          <Label>Options</Label>
                          <div className="space-y-2 mt-2">
                            {question.options.map((option, optIndex) => (
                              <Input
                                key={optIndex}
                                placeholder={`Option ${optIndex + 1}`}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options!];
                                  newOptions[optIndex] = e.target.value;
                                  updateQuestion(question.id, {
                                    options: newOptions,
                                  });
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Link href="/main/quizzes">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} className="gap-2">
            Create Quiz
          </Button>
        </div>
      </main>
    </div>
  );
}
