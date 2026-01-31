import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GraduationCap, Target, Brain, CheckCircle, AlertCircle, ArrowRight, Sparkles, Lock, BookOpen, ListTodo, ChevronRight } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { useProfile, calculateProfileStrengthDetailed } from "@/hooks/useProfile";
import { useDashboardStats, type Stage } from "@/hooks/useDashboardStats";
import { useApplicationTasks } from "@/hooks/useApplicationTasks";
const STAGE_CONFIG: Record<Stage, {
  label: string;
  icon: React.ElementType;
  nextAction: string;
  nextRoute: string;
}> = {
  onboarding: {
    label: "Onboarding",
    icon: GraduationCap,
    nextAction: "Complete your profile to unlock AI recommendations",
    nextRoute: "/onboarding"
  },
  discover: {
    label: "Discover",
    icon: Target,
    nextAction: "Explore and shortlist universities with AI guidance",
    nextRoute: "/universities"
  },
  lock_choices: {
    label: "Lock Choices",
    icon: Lock,
    nextAction: "Lock your final university choices to proceed",
    nextRoute: "/universities"
  },
  applications: {
    label: "Applications",
    icon: BookOpen,
    nextAction: "Follow your personalized application roadmap",
    nextRoute: "/applications"
  }
};
const STAGES: Stage[] = ["onboarding", "discover", "lock_choices", "applications"];
export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    profile,
    profileStrength,
    loading: profileLoading
  } = useProfile();
  const { stats, currentStage, loading: statsLoading } = useDashboardStats(profile);
  const { tasks, toggleTaskCompletion, isLoading: tasksLoading } = useApplicationTasks();
  const profileStrengthDetailed = calculateProfileStrengthDetailed(profile);
  useEffect(() => {
    const getUser = async () => {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?mode=login");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    getUser();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth?mode=login");
      } else {
        setUser(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Strict flow: block dashboard until onboarding is complete
  useEffect(() => {
    if (!loading && !profileLoading && user && (!profile || !profile.onboarding_completed)) {
      navigate("/onboarding", { replace: true });
    }
  }, [loading, profileLoading, user, profile, navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  const mustCompleteOnboarding = user && (!profile || !profile.onboarding_completed);
  if (loading || profileLoading || mustCompleteOnboarding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Student";
  const currentStageIndex = STAGES.indexOf(currentStage);
  const stageConfig = STAGE_CONFIG[currentStage];
  const getStageStatus = (stage: Stage, index: number) => {
    if (index < currentStageIndex) return "completed";
    if (index === currentStageIndex) return "current";
    return "locked";
  };
  return <Layout isAuthenticated onLogout={handleLogout} currentStage={stageConfig.label}>
      <div className="container py-8 lg:py-12 pb-[640px]">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profile?.onboarding_completed ? "Here's your study abroad journey at a glance." : "Complete your profile to unlock AI-powered university recommendations."}
          </p>
        </div>

        {/* Current Stage CTA */}
        <Card className={`p-6 mb-8 border-primary/20 ${currentStage === "onboarding" ? "bg-primary/5" : "bg-gradient-to-r from-primary/5 to-secondary/5"}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStage === "onboarding" ? "bg-primary/10" : "bg-gradient-to-br from-primary to-secondary"}`}>
              {currentStage === "onboarding" ? <AlertCircle className="h-6 w-6 text-primary" /> : <Sparkles className="h-6 w-6 text-primary-foreground" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {currentStage === "onboarding" ? "Complete Your Onboarding" : `Current Stage: ${stageConfig.label}`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {stageConfig.nextAction}
              </p>
            </div>
            <Button className="gap-2" onClick={() => navigate(stageConfig.nextRoute)}>
              {currentStage === "onboarding" ? "Start Onboarding" : "Continue"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>

        {/* Profile Strength (AI-style: Academics, Exams, Budget, Overall) */}
        {profile && <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold">Profile Strength</h3>
                <p className="text-sm text-muted-foreground">
                  Academics: {profileStrengthDetailed.academics} · Exams: {profileStrengthDetailed.exams} · Budget: {profileStrengthDetailed.budgetFit}
                </p>
              </div>
              <span className={`text-2xl font-bold ${profileStrengthDetailed.overallReadinessScore >= 70 ? "text-green-600" : profileStrengthDetailed.overallReadinessScore >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                {profileStrengthDetailed.overallReadinessScore}
              </span>
            </div>
            <Progress value={Math.min(100, profileStrengthDetailed.overallReadinessScore)} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {profileStrength.completedFields} of {profileStrength.totalFields} fields completed
            </p>
          </Card>}

        {/* Stage Tracker */}
        <div className="mb-8">
          <h2 className="font-display text-xl font-semibold mb-4">Your Journey</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {STAGES.map((stage, index) => {
            const status = getStageStatus(stage, index);
            const config = STAGE_CONFIG[stage];
            const StageIcon = config.icon;
            return <div key={stage} className={`relative p-4 rounded-xl border transition-all ${status === "current" ? "border-primary bg-primary/5 shadow-sm" : status === "completed" ? "border-green-500/30 bg-green-500/5" : "border-border bg-muted/30 opacity-50"}`}>
                  {index > 0 && <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden md:block">
                      <div className={`w-8 h-0.5 ${status === "completed" || status === "current" ? "bg-primary/50" : "bg-border"}`} />
                    </div>}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status === "current" ? "bg-primary text-primary-foreground" : status === "completed" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}>
                      {status === "completed" ? <CheckCircle className="h-5 w-5" /> : <StageIcon className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{config.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {status === "current" ? "In Progress" : status === "completed" ? "Completed" : "Locked"}
                      </p>
                    </div>
                  </div>
                </div>;
          })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          {profile?.onboarding_completed ? (
            <Card className="p-6 transition-all hover:shadow-md cursor-pointer" onClick={() => navigate("/counsellor")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">AI Counsellor</p>
                  <p className="font-semibold">Ready to assist</p>
                </div>
              </div>
            </Card>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-6 transition-all opacity-75 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <Brain className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">AI Counsellor</p>
                      <p className="font-semibold">Complete onboarding first</p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                Complete your profile in Onboarding to unlock the AI Counsellor and university discovery.
              </TooltipContent>
            </Tooltip>
          )}

          {profile?.onboarding_completed ? (
            <Card className="p-6 transition-all hover:shadow-md cursor-pointer" onClick={() => navigate("/universities")}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Universities</p>
                  <p className="font-semibold">
                    {stats.shortlistedCount} shortlisted
                    {stats.lockedCount > 0 && ` · ${stats.lockedCount} locked`}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="p-6 transition-all opacity-75 cursor-not-allowed">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Universities</p>
                      <p className="font-semibold">Complete onboarding first</p>
                    </div>
                  </div>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                Complete your profile in Onboarding to unlock university discovery and shortlisting.
              </TooltipContent>
            </Tooltip>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profileStrengthDetailed.overallReadinessScore >= 70 ? "bg-green-500/10" : profileStrengthDetailed.overallReadinessScore >= 50 ? "bg-yellow-500/10" : "bg-red-500/10"}`}>
                <CheckCircle className={`h-6 w-6 ${profileStrengthDetailed.overallReadinessScore >= 70 ? "text-green-500" : profileStrengthDetailed.overallReadinessScore >= 50 ? "text-yellow-500" : "text-red-500"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Readiness Score</p>
                <p className="font-semibold">{profileStrengthDetailed.overallReadinessScore}/100</p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI To-Do List (when user has locked universities and tasks) */}
        {profile?.onboarding_completed && stats.hasLockedUniversities && tasks.length > 0 && (
          <Card className="p-6 mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                AI To-Do List
              </h3>
              <Button variant="ghost" size="sm" onClick={() => navigate("/applications")} className="gap-1">
                View all
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {tasks.filter((t) => t.is_completed).length} of {tasks.length} completed
            </p>
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {tasks.slice(0, 5).map((task) => (
                <li key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={!!task.is_completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    className="h-4 w-4 rounded border-primary"
                    aria-label={`Mark "${task.title}" as ${task.is_completed ? "incomplete" : "complete"}`}
                  />
                  <span className={`flex-1 text-sm ${task.is_completed ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </span>
                  {task.priority && (
                    <span className={`text-xs px-2 py-0.5 rounded ${task.priority === "high" ? "bg-destructive/10 text-destructive" : task.priority === "medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}>
                      {task.priority}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Profile Summary for completed onboarding */}
        {profile?.onboarding_completed && <Card className="p-6 mt-8 grid mb-[100px]">
            <h3 className="font-semibold mb-4">Profile Summary</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Target Degree</p>
                <p className="font-medium capitalize">{profile.intended_degree || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Field of Study</p>
                <p className="font-medium">{profile.field_of_study || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Target Intake</p>
                <p className="font-medium capitalize">
                  {profile.target_intake_term && profile.target_intake_year ? `${profile.target_intake_term} ${profile.target_intake_year}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Budget Range</p>
                <p className="font-medium">
                  {profile.budget_min && profile.budget_max ? `$${profile.budget_min.toLocaleString()} - $${profile.budget_max.toLocaleString()}` : "—"}
                </p>
              </div>
            </div>
          </Card>}
      </div>
    </Layout>;
}