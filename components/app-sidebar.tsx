"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  ListChecks,
  BarChart2,
  BookOpen,
  Users,
  Settings,
  HelpCircle,
  GraduationCap,
  Shield,
  Trophy,
  FileText,
} from "lucide-react"
import type { Icon } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { authClient } from "@/lib/auth-client"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  role?: "student" | "teacher" | "admin"
  user?: {
    name: string
    email: string
    avatar?: string | null
    firstName?: string | null
  }
}

const getRoleBasedNav = (role: "student" | "teacher" | "admin") => {
  const baseNav = [
    {
      title: "Dashboard",
      url: role === "student" ? "/dashboard/student" : role === "teacher" ? "/dashboard/teacher" : "/dashboard/admin",
      icon: LayoutDashboard,
    },
  ]

  if (role === "student") {
    return [
      ...baseNav,
      {
        title: "Quizzes",
        url: "/quizzes",
        icon: ListChecks,
      },
      {
        title: "Results",
        url: "/quizzes/result",
        icon: BarChart2,
      },
    ]
  }

  if (role === "teacher") {
    return [
      ...baseNav,
      {
        title: "Quizzes",
        url: "/quizzes",
        icon: ListChecks,
      },
      {
        title: "Courses",
        url: "/courses/create",
        icon: BookOpen,
      },
      {
        title: "Analytics",
        url: "/analytics",
        icon: BarChart2,
      },
    ]
  }

  // Admin
  return [
    ...baseNav,
    {
      title: "Users",
      url: "#",
      icon: Users,
    },
    {
      title: "Courses",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart2,
    },
  ]
}

const getRoleBasedDocuments = (role: "student" | "teacher" | "admin") => {
  if (role === "student") {
    return [
      {
        name: "My Results",
        url: "/quizzes/result",
        icon: Trophy,
      },
      {
        name: "Quiz History",
        url: "#",
        icon: FileText,
      },
    ]
  }

  if (role === "teacher") {
    return [
      {
        name: "My Quizzes",
        url: "/quizzes",
        icon: ListChecks,
      },
      {
        name: "Reports",
        url: "/analytics",
        icon: BarChart2,
      },
    ]
  }

  // Admin
  return [
    {
      name: "User Management",
      url: "#",
      icon: Users,
    },
    {
      name: "System Reports",
      url: "/analytics",
      icon: BarChart2,
    },
  ]
}

export function AppSidebar({ role = "student", user, ...props }: AppSidebarProps) {
  const [currentUser, setCurrentUser] = React.useState(user)

  React.useEffect(() => {
    if (!user) {
      authClient.getSession().then((session) => {
        if (session?.data?.user) {
          const userData = session.data.user as any
          setCurrentUser({
            name: userData.name || `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email,
            email: userData.email,
            avatar: userData.image,
            firstName: userData.firstName,
          })
        }
      })
    }
  }, [user])

  const navMain = getRoleBasedNav(role)
  const documents = getRoleBasedDocuments(role)
  const navSecondary = [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: HelpCircle,
    },
  ]

  const displayName = currentUser?.name || "User"
  const displayEmail = currentUser?.email || ""
  const userAvatar = currentUser?.avatar || undefined

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
                  <span className="text-sm font-bold">A+</span>
                </div>
                <span className="text-base font-semibold">A+ Quiz</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {documents.length > 0 && (
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="px-2 py-2">
              <div className="text-sidebar-foreground/70 mb-2 px-2 text-xs font-semibold">
                {role === "student" ? "My Resources" : role === "teacher" ? "Teaching Tools" : "Management"}
              </div>
              <div className="space-y-1">
                {documents.map((doc) => {
                  const Icon = doc.icon as React.ComponentType<{ className?: string }>
                  return (
                    <Link
                      key={doc.name}
                      href={doc.url}
                      className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors"
                    >
                      <Icon className="size-4" />
                      <span>{doc.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: displayName,
            email: displayEmail,
            avatar: userAvatar || "/avatars/default.jpg",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
