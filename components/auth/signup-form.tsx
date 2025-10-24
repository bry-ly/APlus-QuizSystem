"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, HelpCircle } from "lucide-react";
import Link from "next/link";
import React from "react";

const COURSES = [
  "B.S. in Criminology",
  "B.S. in Information Technology",
  "B.S. in Computer Science",
  "B.S. in Electronics Engineering",
  "B.S. in Computer Engineering",
  "B.S. in Tourism Management",
  "B.S. in Hospitality Management",
  "B.S. in Bus. Ad. Major in Financial Management",
  "B.S. in Bus. Ad. Major in Marketing Management",
  "Bachelor of Elem. Ed.",
  "Bachelor of Sec. Ed. Major in English",
  "Bachelor of Sec. Ed. Major in Mathematics",
  "Bachelor of Sec. Ed. Major in Social Studies",
];

const DEPARTMENTS = [
  "ECT - Engineering and Communications Technology",
  "BHT - Business, Hospitality & Tourism",
  "CJE - Criminal Justice Education",
  "EDUC - Education",
];

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [userType, setUserType] = React.useState("student");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] = React.useState("");
  const [infoDialogOpen, setInfoDialogOpen] = React.useState(false);

  const handleUserTypeChange = (value: string) => {
    setUserType(value);
    setSelectedOption("");
    setDialogOpen(true);
  };

  const handleSelectOption = (option: string) => {
    setSelectedOption(option);
    setDialogOpen(false);
  };

  const options = userType === "student" ? COURSES : DEPARTMENTS;
  const dialogTitle =
    userType === "student" ? "Select Your Course" : "Select Your Department";

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-1">
          <div>
            <FieldGroup className="gap-3">
              <Field className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="first-name">First Name</FieldLabel>
                  <Input id="first-name" type="text" placeholder="" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="last-name">Last Name</FieldLabel>
                  <Input id="last-name" type="text" placeholder="" required />
                </Field>
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirm ? "text" : "password"}
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowConfirm((v) => !v)}
                        aria-label={
                          showConfirm ? "Hide password" : "Show password"
                        }
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <div className="flex items-center gap-2">
                  <FieldLabel>Register as</FieldLabel>
                  <button
                    type="button"
                    onClick={() => setInfoDialogOpen(true)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Information about registration types"
                  >
                    <HelpCircle className="size-4" />
                  </button>
                </div>
                <RadioGroup
                  value={userType}
                  onValueChange={handleUserTypeChange}
                  className="grid grid-cols-2 gap-3"
                >
                  <Label
                    htmlFor="student"
                    className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent transition-colors"
                  >
                    <RadioGroupItem value="student" id="student" />
                    <span>Student</span>
                  </Label>
                  <Label
                    htmlFor="teacher"
                    className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-accent transition-colors"
                  >
                    <RadioGroupItem value="teacher" id="teacher" />
                    <span>Teacher</span>
                  </Label>
                </RadioGroup>
                {selectedOption && (
                  <FieldDescription className="mt-2">
                    Selected:{" "}
                    <span className="font-medium">{selectedOption}</span>
                  </FieldDescription>
                )}
              </Field>
              <Field className="pt-3">
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
                <FieldDescription className="text-center pt-1">
                  Already have an account? <Link href="/login">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center text-xs">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogOverlay className="backdrop-blur-xs" />
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Choose your {userType === "student" ? "course" : "department"}{" "}
              from the list below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => handleSelectOption(option)}
                className="text-left p-3 rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                {option}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogOverlay className="backdrop-blur-xs" />
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Registration Information</DialogTitle>
            <DialogDescription>
              Choose the account type that best describes you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  S
                </span>
                Student Account
              </h4>
              <p className="text-sm text-muted-foreground pl-8">
                Register as a student if you are enrolled in any course. You
                will be able to:
              </p>
              <ul className="text-sm text-muted-foreground pl-8 space-y-1 list-disc list-inside">
                <li>Take quizzes and exams</li>
                <li>View your scores by subject</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  T
                </span>
                Teacher Account
              </h4>
              <p className="text-sm text-muted-foreground pl-8">
                Register as a teacher if you are a faculty member. You will be
                able to:
              </p>
              <ul className="text-sm text-muted-foreground pl-8 space-y-1 list-disc list-inside">
                <li>Create questionnaires</li>
                <li>View student scores</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
