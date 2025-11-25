"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export interface Examination {
  id: string;
  quiz: {
    title: string;
    passingScore: number;
  };
  score: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  completedAt: string;
  createdAt: string;
}

export function useResults() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Examination[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const session = await authClient.getSession();
        if (!session?.data?.user) {
          router.push("/login");
          return;
        }

        if ((session.data.user as any).role !== "student") {
          router.push("/");
          return;
        }

        setUser(session.data.user);

        // Fetch examinations
        const response = await fetch("/api/examinations");
        if (response.ok) {
          const data = await response.json();
          setResults(data.data);
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/examinations/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setResults(results.filter((r) => r.id !== deleteId));
        toast.success("Result deleted successfully");
      } else {
        console.error("Failed to delete result");
        toast.error("Failed to delete result");
      }
    } catch (error) {
      console.error("Error deleting result:", error);
      toast.error("An error occurred while deleting the result");
    } finally {
      setDeleteId(null);
    }
  };

  return {
    user,
    loading,
    results,
    deleteId,
    setDeleteId,
    handleDelete,
    confirmDelete,
  };
}
