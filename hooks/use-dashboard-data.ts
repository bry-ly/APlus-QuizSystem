import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface DashboardDataOptions<T> {
  role: "teacher" | "student" | "admin";
  fetchDataFn: () => Promise<T>;
  redirectPath?: string;
}

interface DashboardDataResult<T> {
  user: any;
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useDashboardData<T>({
  role,
  fetchDataFn,
  redirectPath = "/login",
}: DashboardDataOptions<T>): DashboardDataResult<T> {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const session = await authClient.getSession();

      if (!session?.data?.user) {
        router.push(redirectPath);
        return;
      }

      const currentUser = session.data.user as any;
      if (currentUser.role !== role) {
        router.push("/");
        return;
      }

      setUser(currentUser);

      const result = await fetchDataFn();
      setData(result);
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err);
      // Optional: redirect on error or just show error state
      if (err.message === "Unauthorized") {
        router.push(redirectPath);
      }
    } finally {
      setLoading(false);
    }
  }, [role, fetchDataFn, router, redirectPath]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { user, data, loading, error, refresh: loadData };
}
