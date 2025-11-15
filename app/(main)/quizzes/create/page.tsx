"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
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
import { ArrowLeft, Plus, Trash2, Copy, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ShimmeringText } from "@/components/ui/shimmer";

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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdQuizCode, setCreatedQuizCode] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [creating, setCreating] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);

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

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        const data = await response.json();
        if (data.success && data.data) {
          setCourses(data.data);
          if (data.data.length > 0) {
            setSelectedCourseId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoadingCourses(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

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

  const handleQuestionTypeChange = (id: string, newType: Question["type"]) => {
    const question = questions.find((q) => q.id === id);
    if (!question) return;

    const updates: Partial<Question> = { type: newType };

    if (newType === "true-false") {
      updates.options = ["True", "False"];
      updates.correctAnswer = 0;
    } else if (newType === "multiple-choice") {
      updates.options = ["", "", "", ""];
      updates.correctAnswer = 0;
    } else if (newType === "short-answer") {
      updates.options = [];
      updates.correctAnswer = "";
    }

    updateQuestion(id, updates);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a quiz title");
      return;
    }
    if (!selectedCourseId) {
      alert("Please select a course");
      return;
    }
    if (questions.length === 0) {
      alert("Please add at least one question");
      return;
    }

    // Validate all questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || !q.text.trim()) {
        alert(`Question ${i + 1} must have text`);
        return;
      }
      if (q.type === "multiple-choice") {
        if (!q.options || q.options.length < 2) {
          alert(`Question ${i + 1} must have at least 2 options`);
          return;
        }
        const emptyOptions = q.options.filter(opt => !opt || !opt.trim());
        if (emptyOptions.length > 0) {
          alert(`Question ${i + 1} has empty options. Please fill all options.`);
          return;
        }
        if (q.correctAnswer === undefined || q.correctAnswer === null) {
          alert(`Question ${i + 1} must have a correct answer selected`);
          return;
        }
      }
      if (q.type === "true-false" && (q.correctAnswer === undefined || q.correctAnswer === null)) {
        alert(`Question ${i + 1} must have a correct answer selected`);
        return;
      }
      if (q.type === "short-answer" && (!q.correctAnswer || !q.correctAnswer.toString().trim())) {
        alert(`Question ${i + 1} must have a correct answer`);
        return;
      }
    }

    setCreating(true);
    try {

      const response = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          courseId: selectedCourseId,
          timeLimit: parseInt(timeLimit) || null,
          passingScore: parseInt(passingScore) || 50,
          showResults: true,
          bonusEnabled: false,
          questions: questions.map((q, index) => {
            // Validate question before sending
            if (!q.text || !q.text.trim()) {
              throw new Error(`Question ${index + 1} must have text`);
            }

            let correctAnswer = q.correctAnswer?.toString() || "0";
            
            // Handle true/false questions - convert to "true" or "false" strings
            if (q.type === "true-false") {
              correctAnswer = q.correctAnswer === 0 ? "true" : "false";
            }
            
            // Handle multiple choice - ensure options are filled
            if (q.type === "multiple-choice") {
              if (!q.options || q.options.length < 2) {
                throw new Error(`Question ${index + 1} must have at least 2 options`);
              }
              const emptyOptions = q.options.filter(opt => !opt || !opt.trim());
              if (emptyOptions.length > 0) {
                throw new Error(`Question ${index + 1} has empty options`);
              }
            }

            // Handle short-answer (essay) type
            if (q.type === "short-answer") {
              // Map short-answer to essay type for schema compatibility
              return {
                text: q.text.trim(),
                type: "essay",
                options: [],
                correctAnswer: q.correctAnswer?.toString() || "",
                points: q.points || 1,
                order: index,
              };
            }

            return {
              text: q.text.trim(),
              type: q.type,
              options: q.options || [],
              correctAnswer: correctAnswer,
              points: q.points || 1,
              order: index,
            };
          }),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Use the actual accessCode from the API response - it's guaranteed to be there
        const accessCode = data.data.accessCode;
        if (!accessCode) {
          console.error("No accessCode in API response:", data.data);
          alert("Quiz created but access code is missing. Please check the quiz list.");
          return;
        }
        
        console.log("Quiz created successfully:", {
          id: data.data.id,
          title: data.data.title,
          accessCode: accessCode,
          questionsCount: data.data.questions?.length || 0,
          createdAt: data.data.createdAt,
        });
        
        // Verify the access code matches what we expect
        if (accessCode.length < 10) {
          console.warn("Access code seems too short:", accessCode);
        }
        
        setCreatedQuizCode(accessCode);
        setShowSuccessModal(true);
      } else {
        alert(data.error || "Failed to create quiz");
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(createdQuizCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const userRole = user?.role || "teacher"
  const userData = user ? {
    name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    email: user.email,
    avatar: user.image,
    firstName: user.firstName,
  } : undefined

  if (loading) {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" role="teacher" />
        <SidebarInset>
          <SiteHeader title="Create Quiz" />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <main className="max-w-4xl mx-auto w-full px-4">
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" role={userRole} user={userData} />
      <SidebarInset>
        <SiteHeader title="Create Quiz" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <main className="max-w-4xl mx-auto w-full px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/quizzes">
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

        {/* No Courses Warning */}
        {!loadingCourses && courses.length === 0 && (
          <Card className="mb-8 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="size-5" />
                <div>
                  <p className="font-semibold">No courses available</p>
                  <p className="text-sm text-muted-foreground">
                    You need to create a course before creating quizzes. Please contact your administrator or create a course first.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="course">Course *</Label>
                {loadingCourses ? (
                  <div className="mt-2 px-3 py-2 border rounded-lg bg-muted text-sm text-muted-foreground">
                    Loading courses...
                  </div>
                ) : courses.length === 0 ? (
                  <div className="mt-2 px-3 py-2 border rounded-lg bg-destructive/10 text-sm text-destructive">
                    No courses available. Please create a course first.
                  </div>
                ) : (
                  <select
                    id="course"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border rounded-lg bg-background"
                    required
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

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
                            handleQuestionTypeChange(
                              question.id,
                              e.target.value as Question["type"]
                            )
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

                    {/* Multiple Choice Options */}
                    {question.type === "multiple-choice" &&
                      question.options && (
                        <div>
                          <Label>Options (Select the correct answer)</Label>
                          <div className="space-y-2 mt-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex gap-2 items-center">
                                <input
                                  type="radio"
                                  name={`correct-${question.id}`}
                                  checked={question.correctAnswer === optIndex}
                                  onChange={() =>
                                    updateQuestion(question.id, {
                                      correctAnswer: optIndex,
                                    })
                                  }
                                  className="w-4 h-4 text-primary"
                                />
                                <Input
                                  placeholder={`Option ${optIndex + 1}`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options!];
                                    newOptions[optIndex] = e.target.value;
                                    updateQuestion(question.id, {
                                      options: newOptions,
                                    });
                                  }}
                                  className="flex-1"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* True/False Options */}
                    {question.type === "true-false" && (
                      <div>
                        <Label>Correct Answer</Label>
                        <div className="space-y-2 mt-2">
                          <div className="flex gap-2 items-center">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === 0}
                              onChange={() =>
                                updateQuestion(question.id, {
                                  correctAnswer: 0,
                                })
                              }
                              className="w-4 h-4 text-primary"
                            />
                            <Label className="font-normal cursor-pointer">
                              True
                            </Label>
                          </div>
                          <div className="flex gap-2 items-center">
                            <input
                              type="radio"
                              name={`correct-${question.id}`}
                              checked={question.correctAnswer === 1}
                              onChange={() =>
                                updateQuestion(question.id, {
                                  correctAnswer: 1,
                                })
                              }
                              className="w-4 h-4 text-primary"
                            />
                            <Label className="font-normal cursor-pointer">
                              False
                            </Label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Short Answer */}
                    {question.type === "short-answer" && (
                      <div>
                        <Label>Correct Answer (for reference)</Label>
                        <Input
                          placeholder="Enter the expected answer"
                          value={question.correctAnswer?.toString() || ""}
                          onChange={(e) =>
                            updateQuestion(question.id, {
                              correctAnswer: e.target.value,
                            })
                          }
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          This will be used as a reference for manual grading
                        </p>
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
          <Link href="/quizzes">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button 
            onClick={handleSave} 
            className="gap-2" 
            disabled={creating || loadingCourses || courses.length === 0}
          >
            {creating ? "Creating..." : "Create Quiz"}
          </Button>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <CheckCircle2 className="size-16 text-green-500" />
              </div>
              <CardTitle className="text-center text-2xl">
                Quiz Created Successfully!
              </CardTitle>
              <CardDescription className="text-center">
                Your quiz has been created. Share this access code with students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Quiz Access Code
                </Label>
                <div className="text-4xl font-bold tracking-wider my-4">
                  <ShimmeringText
                    text={createdQuizCode}
                    duration={2}
                    wave={false}
                    className="text-primary"
                  />
                </div>
                <Button
                  onClick={copyCodeToClipboard}
                  variant="outline"
                  className="gap-2 mt-2"
                >
                  {copiedCode ? (
                    <>
                      <CheckCircle2 className="size-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Students can use this code to access
                  and take the quiz. Keep it safe and share only with authorized
                  students.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowSuccessModal(false);
                    // Force refresh by using router.refresh and then push
                    router.refresh();
                    router.push("/quizzes");
                  }}
                >
                  View All Quizzes
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    setShowSuccessModal(false);
                    // Reset form
                    setTitle("");
                    setDescription("");
                    setSubject("");
                    setTimeLimit("30");
                    setPassingScore("70");
                    setQuestions([]);
                    setCreatedQuizCode("");
                    if (courses.length > 0) {
                      setSelectedCourseId(courses[0].id);
                    }
                  }}
                >
                  Create Another
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
              </main>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
