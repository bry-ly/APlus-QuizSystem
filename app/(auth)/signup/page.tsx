import { PlusIcon } from "lucide-react"
import { Metadata } from "next"
import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "A+ Quiz | Signup",
};

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <PlusIcon className="size-8" />
          </div>
          A+ Quiz
        </Link>
        <SignupForm />
      </div>
    </div>
  )
}
