import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

export type Stage = "onboarding" | "discover" | "lock_choices" | "applications";

export const STAGE_LABELS: Record<Stage, string> = {
  onboarding: "Onboarding",
  discover: "Discover",
  lock_choices: "Lock Choices",
  applications: "Applications",
};

interface DashboardStats {
  shortlistedCount: number;
  lockedCount: number;
  hasLockedUniversities: boolean;
  totalUniversities: number;
}

interface UseDashboardResult {
  stats: DashboardStats;
  loading: boolean;
  currentStage: Stage;
  refetch: () => Promise<void>;
  syncStageToDatabase: (stage: Stage) => Promise<boolean>;
}

export function calculateCurrentStage(
  profile: Profile | null,
  hasLockedUniversities: boolean,
  hasApplicationTasks?: boolean
): Stage {
  // If no profile or onboarding not completed, user is in onboarding
  if (!profile || !profile.onboarding_completed) {
    return "onboarding";
  }

  // If onboarding is completed but no locked universities, user is in discover
  if (!hasLockedUniversities) {
    return "discover";
  }

  // If has locked universities and has started applications
  if (hasApplicationTasks) {
    return "applications";
  }

  // Has locked universities but hasn't started applications yet
  return "lock_choices";
}

export async function syncStageToDatabase(stage: Stage): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await supabase
      .from("profiles")
      .update({ current_stage: stage })
      .eq("user_id", session.user.id);

    if (error) {
      console.error("Failed to sync stage to database:", error);
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error syncing stage:", err);
    return false;
  }
}

export function useDashboardStats(profile: Profile | null): UseDashboardResult {
  const [stats, setStats] = useState<DashboardStats>({
    shortlistedCount: 0,
    lockedCount: 0,
    hasLockedUniversities: false,
    totalUniversities: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasApplicationTasks, setHasApplicationTasks] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setLoading(false);
        return;
      }

      // Fetch universities
      const { data: universities } = await supabase
        .from("universities")
        .select("id, is_shortlisted, is_locked")
        .eq("user_id", session.user.id);

      // Fetch application tasks to determine if user has started applications
      const { data: tasks } = await supabase
        .from("application_tasks")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1);

      if (universities) {
        const shortlistedCount = universities.filter(u => u.is_shortlisted).length;
        const lockedCount = universities.filter(u => u.is_locked).length;
        
        setStats({
          shortlistedCount,
          lockedCount,
          hasLockedUniversities: lockedCount > 0,
          totalUniversities: universities.length,
        });
      }

      setHasApplicationTasks((tasks?.length || 0) > 0);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const currentStage = calculateCurrentStage(profile, stats.hasLockedUniversities, hasApplicationTasks);

  // Auto-sync stage to database when it changes
  useEffect(() => {
    if (profile && profile.current_stage !== currentStage) {
      syncStageToDatabase(currentStage);
    }
  }, [profile, currentStage]);

  return { 
    stats, 
    loading, 
    currentStage,
    refetch: fetchStats,
    syncStageToDatabase,
  };
}
