import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Deletes all user data (universities, application tasks) and resets profile
 * so the user can create a new profile. Only AI-generated data will show after
 * they generate recommendations and tasks again.
 */
export function useResetUserData() {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const resetUserData = useCallback(async (): Promise<boolean> => {
    setIsResetting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Not signed in", variant: "destructive" });
        return false;
      }

      // 1. Delete all application tasks for this user
      const { error: tasksError } = await supabase
        .from("application_tasks")
        .delete()
        .eq("user_id", user.id);

      if (tasksError) {
        console.error("Error deleting tasks:", tasksError);
        toast({
          title: "Error",
          description: "Failed to delete tasks. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // 2. Delete all universities (shortlisted/recommendations) for this user
      const { error: universitiesError } = await supabase
        .from("universities")
        .delete()
        .eq("user_id", user.id);

      if (universitiesError) {
        console.error("Error deleting universities:", universitiesError);
        toast({
          title: "Error",
          description: "Failed to delete universities. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // 3. Reset profile: clear all data, set onboarding incomplete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          education_level: null,
          degree_major: null,
          graduation_year: null,
          gpa_percentage: null,
          intended_degree: null,
          field_of_study: null,
          target_intake_year: null,
          target_intake_term: null,
          preferred_countries: null,
          budget_min: null,
          budget_max: null,
          funding_plan: null,
          ielts_toefl_status: null,
          ielts_toefl_score: null,
          gre_gmat_status: null,
          gre_gmat_score: null,
          sop_status: null,
          onboarding_completed: false,
          onboarding_step: 1,
          current_stage: "onboarding",
        })
        .eq("user_id", user.id);

      if (profileError) {
        console.error("Error resetting profile:", profileError);
        toast({
          title: "Error",
          description: "Failed to reset profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Data reset",
        description: "Your profile, universities, and tasks have been cleared. You can create a new profile now.",
      });
      return true;
    } catch (err) {
      console.error("Reset error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsResetting(false);
    }
  }, [toast]);

  return { resetUserData, isResetting };
}
