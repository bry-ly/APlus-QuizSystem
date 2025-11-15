"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Loader2, KeyRound } from "lucide-react"
import { toast } from "sonner"

interface SiteHeaderProps {
  title?: string
}

export function SiteHeader({ title = "Dashboard" }: SiteHeaderProps) {
  const [code, setCode] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleQuizCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedCode = code.trim().toUpperCase()
    
    if (!trimmedCode) {
      setError("Please enter a quiz code")
      toast.error("Please enter a quiz code")
      return
    }

    setError("")
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/quizzes/code/${trimmedCode}`)
      const data = await response.json()

      if (data.success && data.data) {
        toast.success("Quiz found! Redirecting...")
        window.location.href = `/quizzes/${data.data.id}`
      } else {
        // Show specific error message from API if available
        const errorMessage = data.error || "Invalid quiz code. Please check and try again."
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error("Error looking up quiz:", error)
      const errorMessage = "Failed to find quiz. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={handleQuizCodeSubmit} className="flex items-center gap-2">
            <div className="relative hidden sm:flex">
              <KeyRound className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter quiz code"
                value={code}
                onChange={(e) => {
                  // Allow alphanumeric and dash, convert to uppercase
                  const value = e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase()
                  setCode(value)
                  setError("")
                }}
                className={`h-8 w-40 pl-8 pr-2 ${error ? "border-destructive" : ""}`}
                maxLength={15}
                disabled={isLoading}
                aria-label="Quiz access code"
                aria-invalid={!!error}
                aria-describedby={error ? "code-error" : undefined}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={isLoading}
              className="h-8"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-3 animate-spin" />
                  <span className="hidden sm:inline">Loading</span>
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 size-3 sm:hidden" />
                  <span className="hidden sm:inline">Go</span>
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
