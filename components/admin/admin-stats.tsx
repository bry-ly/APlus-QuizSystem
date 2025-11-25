import { SectionCards } from "@/components/section-cards";
import { AdminStats as AdminStatsType } from "@/hooks/use-admin-dashboard";

interface AdminStatsProps {
  stats: AdminStatsType;
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="mb-8">
      <SectionCards
        cards={[
          {
            title: "Total Users",
            value: stats.totalUsers,
            change: stats.totalUsers > 0 ? 5 : 0,
            changeLabel: "Active users",
            description: "System users",
            trend: "up",
          },
          {
            title: "Teachers",
            value: stats.totalTeachers,
            change: stats.totalTeachers > 0 ? 2 : 0,
            changeLabel: "Faculty members",
            description: "Teaching staff",
            trend: "up",
          },
          {
            title: "Students",
            value: stats.totalStudents,
            change: stats.totalStudents > 0 ? 8 : 0,
            changeLabel: "Enrolled students",
            description: "Active learners",
            trend: "up",
          },
          {
            title: "Total Quizzes",
            value: stats.totalQuizzes,
            change: stats.totalQuizzes > 0 ? 12 : 0,
            changeLabel: "In the system",
            description: "All quizzes",
            trend: "up",
          },
        ]}
        role="admin"
      />
    </div>
  );
}
