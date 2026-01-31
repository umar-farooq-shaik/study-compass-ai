export interface ApplicationTask {
  id: string;
  user_id: string;
  university_id: string | null;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  is_completed: boolean;
  completed_at: string | null;
  due_date: string | null;
  is_ai_generated: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type TaskCategory = "document" | "exam" | "application" | "financial" | "other";
export type TaskPriority = "low" | "medium" | "high";

export const TASK_CATEGORIES: Record<TaskCategory, { label: string; icon: string; color: string }> = {
  document: { label: "Documents", icon: "FileText", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  exam: { label: "Exams", icon: "GraduationCap", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
  application: { label: "Application", icon: "ClipboardList", color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  financial: { label: "Financial", icon: "DollarSign", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  other: { label: "Other", icon: "MoreHorizontal", color: "text-gray-600 bg-gray-100 dark:bg-gray-900/30" },
};

export const TASK_PRIORITIES: Record<TaskPriority, { label: string; color: string }> = {
  high: { label: "High", color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  medium: { label: "Medium", color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30" },
  low: { label: "Low", color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
};
