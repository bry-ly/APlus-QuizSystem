import { PlusIcon } from "lucide-react"
import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link";

export const metadata: Metadata = {
  title: "A+ Quiz | Login",
};

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 self-center font-medium text-lg hover:opacity-80 transition-opacity"
        >
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg shadow-sm">
            <PlusIcon className="size-5" />
          </div>
          <span className="font-semibold">A+ Quiz</span>
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
