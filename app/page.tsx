/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import HeroSection from "@/components/hero-section";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          const role = (session.data.user as any).role;
          setIsAuthenticated(true);
          // Redirect authenticated users to their dashboard
          if (role === "student") {
            router.push("/dashboard/student");
          } else if (role === "teacher") {
            router.push("/dashboard/teacher");
          } else if (role === "admin") {
            router.push("/dashboard/admin");
          } else {
            router.push("/login");
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Show landing page for unauthenticated users (no spinner)
  if (!isAuthenticated && !loading) {
    return <HeroSection />;
  }

  // Return null while checking auth or redirecting authenticated users
  return null;
}
