import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OnboardingFormData, Profile } from "@/types/profile";

const initialFormData: OnboardingFormData = {
  education_level: "",
  degree_major: "",
  graduation_year: "",
  gpa_percentage: "",
  intended_degree: "",
  field_of_study: "",
  target_intake_year: "",
  target_intake_term: "",
  preferred_countries: [],
  budget_min: "",
  budget_max: "",
  funding_plan: "",
  ielts_toefl_status: "",
  ielts_toefl_score: "",
  gre_gmat_status: "",
  gre_gmat_score: "",
  sop_status: "",
};

export function useOnboarding() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const totalSteps = 4;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data as Profile);
        setCurrentStep(data.onboarding_step || 1);
        
        // Populate form with existing data
        setFormData({
          education_level: data.education_level || "",
          degree_major: data.degree_major || "",
          graduation_year: data.graduation_year?.toString() || "",
          gpa_percentage: data.gpa_percentage?.toString() || "",
          intended_degree: data.intended_degree || "",
          field_of_study: data.field_of_study || "",
          target_intake_year: data.target_intake_year?.toString() || "",
          target_intake_term: data.target_intake_term || "",
          preferred_countries: data.preferred_countries || [],
          budget_min: data.budget_min?.toString() || "",
          budget_max: data.budget_max?.toString() || "",
          funding_plan: data.funding_plan || "",
          ielts_toefl_status: data.ielts_toefl_status || "",
          ielts_toefl_score: data.ielts_toefl_score?.toString() || "",
          gre_gmat_status: data.gre_gmat_status || "",
          gre_gmat_score: data.gre_gmat_score?.toString() || "",
          sop_status: data.sop_status || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof OnboardingFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const saveProgress = async (step: number, completed = false) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const updateData: Record<string, unknown> = {
        onboarding_step: step,
        onboarding_completed: completed,
        current_stage: completed ? "discover" : "onboarding",
      };

      // Add step-specific data
      if (step >= 1) {
        updateData.education_level = formData.education_level || null;
        updateData.degree_major = formData.degree_major || null;
        updateData.graduation_year = formData.graduation_year ? parseInt(formData.graduation_year) : null;
        updateData.gpa_percentage = formData.gpa_percentage ? parseFloat(formData.gpa_percentage) : null;
      }
      if (step >= 2) {
        updateData.intended_degree = formData.intended_degree || null;
        updateData.field_of_study = formData.field_of_study || null;
        updateData.target_intake_year = formData.target_intake_year ? parseInt(formData.target_intake_year) : null;
        updateData.target_intake_term = formData.target_intake_term || null;
        updateData.preferred_countries = formData.preferred_countries.length > 0 ? formData.preferred_countries : null;
      }
      if (step >= 3) {
        updateData.budget_min = formData.budget_min ? parseInt(formData.budget_min) : null;
        updateData.budget_max = formData.budget_max ? parseInt(formData.budget_max) : null;
        updateData.funding_plan = formData.funding_plan || null;
      }
      if (step >= 4) {
        updateData.ielts_toefl_status = formData.ielts_toefl_status || null;
        updateData.ielts_toefl_score = formData.ielts_toefl_score ? parseFloat(formData.ielts_toefl_score) : null;
        updateData.gre_gmat_status = formData.gre_gmat_status || null;
        updateData.gre_gmat_score = formData.gre_gmat_score ? parseInt(formData.gre_gmat_score) : null;
        updateData.sop_status = formData.sop_status || null;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        title: "Error",
        description: "Failed to save your progress. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const nextStep = async () => {
    const saved = await saveProgress(currentStep + 1);
    if (saved && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    const saved = await saveProgress(totalSteps, true);
    return saved;
  };

  return {
    currentStep,
    totalSteps,
    formData,
    updateField,
    nextStep,
    prevStep,
    completeOnboarding,
    loading,
    saving,
    profile,
  };
}
