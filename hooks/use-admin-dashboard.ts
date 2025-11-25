"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export interface AdminStats {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalQuizzes: number;
}

export function useAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalQuizzes: 0,
  });
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          if ((session.data.user as any).role !== "admin") {
            router.push("/");
            return;
          }
          setUser(session.data.user);

          // Fetch dashboard stats
          const statsResponse = await fetch("/api/dashboard/stats");
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setStats(
              statsData.data || {
                totalUsers: 0,
                totalTeachers: 0,
                totalStudents: 0,
                totalQuizzes: 0,
              }
            );
          }

          // Fetch quizzes for chart data
          const quizzesResponse = await fetch("/api/quizzes");
          if (quizzesResponse.ok) {
            const quizzesData = await quizzesResponse.json();
            setQuizzes(quizzesData.data || []);
          }
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  return {
    user,
    loading,
    stats,
    quizzes,
  };
}
