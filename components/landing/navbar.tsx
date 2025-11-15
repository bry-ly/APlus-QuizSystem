"use client";
import type React from "react";
import {
  Menu,
  LayoutDashboard,
  ListChecks,
  BarChart2,
  HelpCircle,
  Info,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { toast } from "sonner";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
}

const Navbar = ({
  logo = {
    url: "",
    src: "",
    alt: "logo",
    title: "A+ Quiz",
  },
  menu = [
    {
      title: "Dashboard",
      url: "/main/students",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      title: "Quizzes",
      url: "/main/quizzes",
      icon: <ListChecks className="size-4" />,
    },
    {
      title: "Results",
      url: "/main/results",
      icon: <BarChart2 className="size-4" />,
    },
  ],
  auth = {
    login: { title: "Login", url: "/login" },
    signup: { title: "Sign up", url: "/signup" },
  },
}: NavbarProps) => {
  type AuthUser = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    firstName?: string;
    lastName?: string;
    image?: string | null;
    role?: string;
  };
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleBasedMenu, setRoleBasedMenu] = useState<MenuItem[]>(menu);
  const [quizCode, setQuizCode] = useState("");
  const [mobileQuizCode, setMobileQuizCode] = useState("");
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const session = await authClient.getSession();
  const userData = session?.data?.user as AuthUser | null;
  if (mounted) {
    setUser(userData ?? null);
    
    // Set role-based menu
    if (userData) {
      const role = (userData as any).role;
      const dashboardUrl = role === 'student' ? '/dashboard/student' : 
                          role === 'teacher' ? '/dashboard/teacher' : 
                          role === 'admin' ? '/dashboard/admin' : '/dashboard/student';
      
      const updatedMenu: MenuItem[] = [
        {
          title: "Dashboard",
          url: dashboardUrl,
          icon: <LayoutDashboard className="size-4" />,
        },
      ];
      
      // Teachers and admins get access to quizzes management
      if (role === 'teacher' || role === 'admin') {
        updatedMenu.push({
          title: "Quizzes",
          url: "/quizzes",
          icon: <ListChecks className="size-4" />,
        });
        updatedMenu.push({
          title: "Analytics",
          url: "/analytics",
          icon: <BarChart2 className="size-4" />,
        });
      } else if (role === 'student') {
        // Students see results
        updatedMenu.push({
          title: "Results",
          url: "/quizzes/result",
          icon: <BarChart2 className="size-4" />,
        });
      }
      
      setRoleBasedMenu(updatedMenu);
    }
  }
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Logged out successfully");
            window.location.href = "/login";
          },
          onError: () => {
            toast.error("Failed to log out. Please try again.");
          },
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleQuizCodeSubmit = async (code: string, isMobile = false) => {
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setCodeError("Please enter a quiz code");
      return;
    }

    setCodeError("");
    
    try {
      // Look up quiz by code
      const response = await fetch(`/api/quizzes/code/${trimmedCode}`);
      const data = await response.json();

      if (data.success && data.data) {
        // Navigate to quiz page
        window.location.href = `/quizzes/${data.data.id}`;
      } else {
        // Show specific error message from API if available
        const errorMessage = data.error || "Invalid quiz code. Please check and try again.";
        setCodeError(errorMessage);
      }
    } catch (error) {
      console.error("Error looking up quiz:", error);
      setCodeError("Failed to find quiz. Please try again.");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="w-full px-4 py-5">
        <div className="max-w-7xl mx-auto">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between gap-8">
            {/* Left: Logo */}
            <a
              href={logo.url}
              className="flex items-center gap-2 shrink-0"
            >
              {logo.src ? (
                <Image
                  src={logo.src || "/placeholder.svg"}
                  className="h-8 w-auto dark:invert"
                  alt={logo.alt}
                  width={32}
                  height={32}
                />
              ) : (
                <Plus className="size-5 text-primary" />
              )}
              <span className="text-lg font-bold tracking-tight">
                {logo.title}
              </span>
            </a>

            {/* Center: Navigation */}
            <div className="flex items-center gap-6">
              {roleBasedMenu.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              ))}
            </div>

            {/* Right: Test Code + User/Auth */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Test Code Input */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg border border-border">
                  <input
                    type="text"
                    placeholder="Quiz code"
                    value={quizCode}
                    onChange={(e) => {
                      // Allow alphanumeric and dash, convert to uppercase
                      const value = e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase();
                      setQuizCode(value);
                      setCodeError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleQuizCodeSubmit(quizCode);
                      }
                    }}
                    className="bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none w-36 uppercase"
                    maxLength={15}
                  />
                  <button
                    onClick={() => handleQuizCodeSubmit(quizCode)}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    Enter
                  </button>
                </div>
                {codeError && (
                  <p className="text-xs text-red-500">{codeError}</p>
                )}
              </div>

              {/* User Profile Dropdown or Auth Buttons */}
              {!loading && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted transition-colors">
                      <Image
                        src={user.image || "/placeholder.svg"}
                        alt={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || "User"}
                        width={32}
                        height={32}
                        className="rounded-full border"
                      />
                      <span className="font-medium text-sm truncate max-w-[120px]">
                        {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Profile</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <a href="/profile">View Profile</a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href="/settings">Settings</a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-500">Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <a href={auth.login.url}>{auth.login.title}</a>
                  </Button>
                  <Button asChild size="sm">
                    <a href={auth.signup.url}>{auth.signup.title}</a>
                  </Button>
                </>
              )}

              {/* Help Links */}
              <div className="flex items-center gap-1 border-l border-border pl-4">
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <a href="/about">
                    <Info className="size-4" />
                    <span>About</span>
                  </a>
                </Button>
                <Button asChild variant="ghost" size="sm" className="gap-1">
                  <a href="/help">
                    <HelpCircle className="size-4" />
                    <span>Help</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between">
            {/* Mobile Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              {logo.src ? (
                <Image
                  src={logo.src || "/placeholder.svg"}
                  className="h-8 w-auto dark:invert"
                  alt={logo.alt}
                  width={32}
                  height={32}
                />
              ) : (
                <Plus className="size-5 text-primary" />
              )}
              <span className="text-lg font-bold tracking-tight">
                {logo.title}
              </span>
            </a>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <div className="flex flex-col gap-6 mt-8">
                  {/* Mobile Menu Items */}
                  <div className="flex flex-col gap-3">
                    {roleBasedMenu.map((item) => (
                      <a
                        key={item.title}
                        href={item.url}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
                      >
                        {item.icon}
                        {item.title}
                      </a>
                    ))}
                  </div>

                  {/* Mobile Test Code */}
                  <div className="border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground mb-3">
                      Have a quiz code?
                    </p>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Quiz code"
                          value={mobileQuizCode}
                          onChange={(e) => {
                            setMobileQuizCode(e.target.value.toUpperCase());
                            setCodeError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleQuizCodeSubmit(mobileQuizCode, true);
                            }
                          }}
                          className="flex-1 bg-muted px-3 py-2 rounded-lg text-sm focus:outline-none border border-border uppercase"
                        />
                        <Button
                          onClick={() => handleQuizCodeSubmit(mobileQuizCode, true)}
                          className="px-4 py-2 text-sm font-semibold"
                        >
                          Enter
                        </Button>
                      </div>
                      {codeError && (
                        <p className="text-xs text-red-500">{codeError}</p>
                      )}
                    </div>
                  </div>

                  {/* Mobile Auth */}
                  <div className="border-t border-border pt-4 flex flex-col gap-3">
                    {!loading && user ? (
                      <>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-muted">
                          <Image
                            src={user.image || "/placeholder.svg"}
                            alt={user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || "User"}
                            width={32}
                            height={32}
                            className="rounded-full border"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <a href="/profile">View Profile</a>
                        </Button>
                        <Button asChild variant="outline" className="w-full bg-transparent">
                          <a href="/settings">Settings</a>
                        </Button>
                        <Button onClick={handleSignOut} variant="outline" className="w-full text-red-500 bg-transparent">
                          Sign out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          asChild
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          <a href={auth.login.url}>{auth.login.title}</a>
                        </Button>
                        <Button asChild className="w-full">
                          <a href={auth.signup.url}>{auth.signup.title}</a>
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Mobile Help Links */}
                  <div className="border-t border-border pt-4 flex flex-col gap-2">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <a href="/about">
                        <Info className="size-4" />
                        About
                      </a>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <a href="/help">
                        <HelpCircle className="size-4" />
                        Help
                      </a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export { Navbar };
