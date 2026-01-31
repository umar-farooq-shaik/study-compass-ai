import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { OnboardingFormData } from "@/types/profile";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

type ValidationErrors = Partial<Record<keyof OnboardingFormData, string>>;

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

export function useProfileEditor() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState<OnboardingFormData>(initialFormData);
  const [originalData, setOriginalData] = useState<OnboardingFormData>(initialFormData);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProfile(data);
          const loadedData: OnboardingFormData = {
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
          };
          setFormData(loadedData);
          setOriginalData(loadedData);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(originalData);
    setHasChanges(changed);
  }, [formData, originalData]);

  const updateField = useCallback((field: keyof OnboardingFormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validateField = useCallback((field: keyof OnboardingFormData): string | null => {
    const value = formData[field];

    switch (field) {
      case "education_level":
        if (!value) return "Please select your education level";
        break;
      case "degree_major":
        if (!value || (typeof value === "string" && !value.trim())) return "Please enter your degree or major";
        break;
      case "graduation_year":
        if (!value) return "Please select your graduation year";
        break;
      case "gpa_percentage":
        if (!value) return "Please enter your GPA or percentage";
        const gpa = parseFloat(value as string);
        if (isNaN(gpa) || gpa < 0 || gpa > 100) return "Please enter a valid GPA (0-4) or percentage (0-100)";
        break;
      case "intended_degree":
        if (!value) return "Please select your intended degree";
        break;
      case "field_of_study":
        if (!value) return "Please select your field of study";
        break;
      case "target_intake_year":
        if (!value) return "Please select your target intake year";
        break;
      case "preferred_countries":
        if (Array.isArray(value) && value.length === 0) return "Please select at least one country";
        break;
      case "budget_min":
        if (!value) return "Please enter your minimum budget";
        break;
      case "budget_max":
        if (!value) return "Please enter your maximum budget";
        if (formData.budget_min && parseInt(formData.budget_min) > parseInt(value as string)) {
          return "Maximum budget must be greater than minimum";
        }
        break;
      case "funding_plan":
        if (!value) return "Please select your funding plan";
        break;
      case "ielts_toefl_status":
        if (!value) return "Please select your IELTS/TOEFL status";
        break;
      case "gre_gmat_status":
        if (!value) return "Please select your GRE/GMAT status";
        break;
      case "sop_status":
        if (!value) return "Please select your SOP status";
        break;
    }
    return null;
  }, [formData]);

  const validateAll = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    const requiredFields: (keyof OnboardingFormData)[] = [
      "education_level",
      "degree_major",
      "graduation_year",
      "gpa_percentage",
      "intended_degree",
      "field_of_study",
      "target_intake_year",
      "preferred_countries",
      "budget_min",
      "budget_max",
      "funding_plan",
      "ielts_toefl_status",
      "gre_gmat_status",
      "sop_status",
    ];

    for (const field of requiredFields) {
      const error = validateField(field);
      if (error) {
        newErrors[field] = error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const saveProfile = useCallback(async (): Promise<boolean> => {
    if (!validateAll()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before saving",
        variant: "destructive",
      });
      return false;
    }

    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const updateData = {
        education_level: formData.education_level || null,
        degree_major: formData.degree_major || null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        gpa_percentage: formData.gpa_percentage ? parseFloat(formData.gpa_percentage) : null,
        intended_degree: formData.intended_degree || null,
        field_of_study: formData.field_of_study || null,
        target_intake_year: formData.target_intake_year ? parseInt(formData.target_intake_year) : null,
        target_intake_term: formData.target_intake_term || null,
        preferred_countries: formData.preferred_countries.length > 0 ? formData.preferred_countries : null,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : null,
        funding_plan: formData.funding_plan || null,
        ielts_toefl_status: formData.ielts_toefl_status || null,
        ielts_toefl_score: formData.ielts_toefl_score ? parseFloat(formData.ielts_toefl_score) : null,
        gre_gmat_status: formData.gre_gmat_status || null,
        gre_gmat_score: formData.gre_gmat_score ? parseInt(formData.gre_gmat_score) : null,
        sop_status: formData.sop_status || null,
      };

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", session.user.id);

      if (error) throw error;

      setOriginalData(formData);
      setHasChanges(false);
      
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved. For accurate recommendations, consider regenerating university list and application tasks from Universities and Applications.",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile changes",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  }, [formData, validateAll, toast]);

  const discardChanges = useCallback(() => {
    setFormData(originalData);
    setErrors({});
    setHasChanges(false);
  }, [originalData]);

  return {
    profile,
    formData,
    errors,
    loading,
    saving,
    hasChanges,
    updateField,
    validateField,
    saveProfile,
    discardChanges,
  };
}
