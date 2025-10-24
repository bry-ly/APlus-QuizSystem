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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";

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
              {menu.map((item) => (
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

            {/* Right: Test Code + Auth */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Test Code Input */}
              <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg border border-border">
                <input
                  type="text"
                  placeholder="Test code"
                  className="bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none w-32"
                />
                <button className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
                  Enter
                </button>
              </div>

              {/* Auth Buttons */}
              <Button asChild variant="ghost" size="sm">
                <a href={auth.login.url}>{auth.login.title}</a>
              </Button>
              <Button asChild size="sm">
                <a href={auth.signup.url}>{auth.signup.title}</a>
              </Button>

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
                    {menu.map((item) => (
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
                      Have a test code?
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Test code"
                        className="flex-1 bg-muted px-3 py-2 rounded-lg text-sm focus:outline-none border border-border"
                      />
                      <Button className="px-4 py-2 text-sm font-semibold">
                        Enter
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Auth */}
                  <div className="border-t border-border pt-4 flex flex-col gap-3">
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
