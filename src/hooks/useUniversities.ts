import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { syncStageToDatabase } from "@/hooks/useDashboardStats";
import type { University, UniversityFilters } from "@/types/university";
import type { Profile } from "@/types/profile";

const RECOMMENDATIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/university-recommendations`;

export function useUniversities(profile: Profile | null) {
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<University[]>([]);
  const [shortlisted, setShortlisted] = useState<University[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing shortlisted universities
  const fetchShortlisted = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_shortlisted", true)
        .order("category", { ascending: true });

      if (error) throw error;
      setShortlisted((data as University[]) || []);
    } catch (error) {
      console.error("Error fetching shortlisted:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShortlisted();
  }, [fetchShortlisted]);

  // Generate AI recommendations
  const generateRecommendations = useCallback(async (filters?: UniversityFilters) => {
    if (!profile || isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch(RECOMMENDATIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ profile, filters }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 429) {
          toast({
            title: "Rate Limit Exceeded",
            description: "Please wait a moment before generating more recommendations.",
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

        throw new Error(errorData.error || "Failed to generate recommendations");
      }

      const data = await response.json();
      setRecommendations(data.universities || []);
      
      toast({
        title: "Recommendations Generated",
        description: `Found ${data.universities?.length || 0} universities matching your profile.`,
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate recommendations",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [profile, isGenerating, toast]);

  // Add to shortlist
  const addToShortlist = useCallback(async (university: University) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("universities")
        .insert({
          user_id: user.id,
          name: university.name,
          country: university.country,
          city: university.city,
          program_name: university.program_name,
          degree_type: university.degree_type,
          field_of_study: university.field_of_study,
          tuition_per_year: university.tuition_per_year,
          living_cost_per_year: university.living_cost_per_year,
          category: university.category,
          acceptance_likelihood: university.acceptance_likelihood,
          fit_explanation: university.fit_explanation,
          risk_explanation: university.risk_explanation,
          requirements_summary: university.requirements_summary,
          is_shortlisted: true,
          is_locked: false,
        })
        .select()
        .single();

      if (error) throw error;

      setShortlisted((prev) => [...prev, data as University]);
      setRecommendations((prev) => prev.filter((u) => u.name !== university.name));

      toast({
        title: "Added to Shortlist",
        description: `${university.name} has been added to your shortlist.`,
      });
    } catch (error) {
      console.error("Error adding to shortlist:", error);
      toast({
        title: "Error",
        description: "Failed to add university to shortlist.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Remove from shortlist
  const removeFromShortlist = useCallback(async (universityId: string) => {
    try {
      const { error } = await supabase
        .from("universities")
        .delete()
        .eq("id", universityId);

      if (error) throw error;

      setShortlisted((prev) => prev.filter((u) => u.id !== universityId));

      toast({
        title: "Removed",
        description: "University removed from your shortlist.",
      });
    } catch (error) {
      console.error("Error removing from shortlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove university.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Lock university
  const lockUniversity = useCallback(async (universityId: string) => {
    try {
      const { error } = await supabase
        .from("universities")
        .update({
          is_locked: true,
          locked_at: new Date().toISOString(),
        })
        .eq("id", universityId);

      if (error) throw error;

      // Update local state
      const updatedShortlisted = shortlisted.map((u) =>
        u.id === universityId
          ? { ...u, is_locked: true, locked_at: new Date().toISOString() }
          : u
      );
      setShortlisted(updatedShortlisted);

      // Check if this is the first locked university and update stage
      const lockedAfterUpdate = updatedShortlisted.filter((u) => u.is_locked).length;
      if (lockedAfterUpdate === 1) {
        // First locked university - transition to lock_choices stage
        await syncStageToDatabase("lock_choices");
      }

      toast({
        title: "University Locked 🔒",
        description: "This university is now locked. You can proceed to application guidance.",
      });
    } catch (error) {
      console.error("Error locking university:", error);
      toast({
        title: "Error",
        description: "Failed to lock university.",
        variant: "destructive",
      });
    }
  }, [toast, shortlisted]);

  // Unlock university
  const unlockUniversity = useCallback(async (universityId: string) => {
    try {
      const { error } = await supabase
        .from("universities")
        .update({
          is_locked: false,
          locked_at: null,
        })
        .eq("id", universityId);

      if (error) throw error;

      // Update local state
      const updatedShortlisted = shortlisted.map((u) =>
        u.id === universityId ? { ...u, is_locked: false, locked_at: undefined } : u
      );
      setShortlisted(updatedShortlisted);

      // Check if no universities are locked anymore and revert stage
      const lockedAfterUpdate = updatedShortlisted.filter((u) => u.is_locked).length;
      if (lockedAfterUpdate === 0) {
        // No locked universities - revert to discover stage
        await syncStageToDatabase("discover");
      }

      toast({
        title: "University Unlocked",
        description: "You can now make changes to this university.",
      });
    } catch (error) {
      console.error("Error unlocking university:", error);
      toast({
        title: "Error",
        description: "Failed to unlock university.",
        variant: "destructive",
      });
    }
  }, [toast, shortlisted]);

  const lockedCount = shortlisted.filter((u) => u.is_locked).length;

  return {
    recommendations,
    shortlisted,
    isGenerating,
    isLoading,
    lockedCount,
    generateRecommendations,
    addToShortlist,
    removeFromShortlist,
    lockUniversity,
    unlockUniversity,
    refetch: fetchShortlisted,
  };
}
