import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { ApplicationTask, TaskCategory } from "@/types/task";

const GENERATE_TASKS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-tasks`;

export function useApplicationTasks() {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<ApplicationTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch existing tasks
  const fetchTasks = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("application_tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setTasks((data as ApplicationTask[]) || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Generate tasks using AI (regenerate = true deletes existing and generates new)
  const generateTasks = useCallback(async (regenerate = false) => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(GENERATE_TASKS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ regenerate }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
          return;
        }
        
        if (response.status === 402) {
          toast({
            title: "Credits Exhausted",
            description: "AI credits have run out. Please add more credits.",
            variant: "destructive",
          });
          return;
        }

        throw new Error(errorData.error || "Failed to generate tasks");
      }

      const data = await response.json();
      
      if (data.regenerate === false && !regenerate) {
        toast({
          title: "Tasks Already Generated",
          description: "Your application tasks have already been created. Use Regenerate to create new tasks.",
        });
      } else {
        toast({
          title: regenerate ? "Tasks Regenerated" : "Tasks Generated",
          description: data.message || "Your personalized application tasks are ready.",
        });
      }

      await fetchTasks();
    } catch (error) {
      console.error("Error generating tasks:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate tasks",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, toast, fetchTasks]);

  // Toggle task completion
  const toggleTaskCompletion = useCallback(async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newCompleted = !task.is_completed;
      
      const { error } = await supabase
        .from("application_tasks")
        .update({
          is_completed: newCompleted,
          completed_at: newCompleted ? new Date().toISOString() : null,
        })
        .eq("id", taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, is_completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
          : t
      ));

      toast({
        title: newCompleted ? "Task Completed" : "Task Reopened",
        description: task.title,
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    }
  }, [tasks, toast]);

  // Delete task
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("application_tasks")
        .delete()
        .eq("id", taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(t => t.id !== taskId));

      toast({
        title: "Task Deleted",
        description: "The task has been removed.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Group tasks by category
  const tasksByCategory = tasks.reduce((acc, task) => {
    const category = task.category as TaskCategory;
    if (!acc[category]) acc[category] = [];
    acc[category].push(task);
    return acc;
  }, {} as Record<TaskCategory, ApplicationTask[]>);

  const completedCount = tasks.filter(t => t.is_completed).length;
  const totalCount = tasks.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    tasks,
    tasksByCategory,
    isLoading,
    isGenerating,
    completedCount,
    totalCount,
    progressPercentage,
    generateTasks,
    toggleTaskCompletion,
    deleteTask,
    refetch: fetchTasks,
  };
}
