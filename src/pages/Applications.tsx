import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sparkles,
  Lock,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Calendar,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useApplicationTasks } from "@/hooks/useApplicationTasks";
import { TaskProgress } from "@/components/applications/TaskProgress";
import { TaskList } from "@/components/applications/TaskList";

export default function Applications() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { profile, loading: profileLoading } = useProfile();
  const { stats } = useDashboardStats(profile);
  const {
    tasks,
    tasksByCategory,
    isLoading: tasksLoading,
    isGenerating,
    completedCount,
    totalCount,
    progressPercentage,
    generateTasks,
    toggleTaskCompletion,
    deleteTask,
  } = useApplicationTasks();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?mode=login");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth?mode=login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Onboarding gate: must complete profile first
  const mustCompleteOnboarding = user && (!profile || !profile.onboarding_completed);
  const hasLockedUniversities = stats.hasLockedUniversities;

  useEffect(() => {
    if (!loading && !profileLoading && mustCompleteOnboarding) {
      navigate("/onboarding", { replace: true });
    }
  }, [loading, profileLoading, mustCompleteOnboarding, navigate]);

  if (loading || profileLoading || mustCompleteOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If no locked universities, show gate message
  if (!hasLockedUniversities) {
    return (
      <Layout isAuthenticated onLogout={handleLogout} currentStage="Applications">
        <div className="container py-12">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card className="max-w-lg mx-auto p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">
              Lock Universities First
            </h2>
            <p className="text-muted-foreground mb-6">
              You need to lock at least one university before accessing the Application Guidance page.
              Locking a university commits you to applying and unlocks your personalized application roadmap.
            </p>
            <Button onClick={() => navigate("/universities")} className="gap-2">
              <Lock className="h-4 w-4" />
              Go to Universities
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isAuthenticated onLogout={handleLogout} currentStage="Applications">
      <div className="container py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              Application Guidance
            </h1>
            <p className="text-muted-foreground">
              Your personalized roadmap to completing your applications.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className="gap-1 px-3 py-1.5">
              <Lock className="h-3.5 w-3.5" />
              {stats.lockedCount} Universities Locked
            </Badge>
            
            {tasks.length === 0 ? (
              <Button onClick={() => generateTasks(false)} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Tasks
                  </>
                )}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => generateTasks(true)} disabled={isGenerating} className="gap-2">
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Tasks
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {tasksLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : tasks.length === 0 ? (
          /* Empty State */
          <Card className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="font-display text-xl font-semibold mb-3">
              Generate Your Application Roadmap
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Our AI will analyze your locked universities and profile to create a personalized 
              task list covering documents, exams, applications, and financial requirements.
            </p>
            <Button onClick={() => generateTasks(false)} disabled={isGenerating} size="lg" className="gap-2">
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating Tasks...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Personalized Tasks
                </>
              )}
            </Button>
          </Card>
        ) : (
          /* Tasks View */
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Sidebar - Progress & Timeline */}
            <div className="lg:col-span-1 space-y-6">
              <TaskProgress
                tasks={tasks}
                completedCount={completedCount}
                totalCount={totalCount}
                progressPercentage={progressPercentage}
              />

              {/* Timeline view: tasks with due dates sorted */}
              {tasks.some((t) => t.due_date) && (
                <Card className="p-4">
                  <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    Timeline
                  </h4>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {[...tasks]
                      .filter((t) => t.due_date)
                      .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
                      .slice(0, 8)
                      .map((task) => (
                        <li key={task.id} className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground shrink-0 w-20">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" }) : "—"}
                          </span>
                          <span className={`truncate ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </span>
                        </li>
                      ))}
                  </ul>
                </Card>
              )}

              {/* Quick Tips */}
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm mb-1">Pro Tip</h4>
                    <p className="text-xs text-muted-foreground">
                      Focus on high-priority tasks first. Complete document preparation 
                      early to avoid last-minute rushes.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content - Task List */}
            <div className="lg:col-span-2">
              <TaskList
                tasksByCategory={tasksByCategory}
                onToggle={toggleTaskCompletion}
                onDelete={deleteTask}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
