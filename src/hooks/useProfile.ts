import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;

interface ProfileStrength {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
}

const PROFILE_FIELDS = [
  { key: "education_level", label: "Education Level" },
  { key: "degree_major", label: "Degree/Major" },
  { key: "graduation_year", label: "Graduation Year" },
  { key: "gpa_percentage", label: "GPA/Percentage" },
  { key: "intended_degree", label: "Intended Degree" },
  { key: "field_of_study", label: "Field of Study" },
  { key: "target_intake_year", label: "Target Intake Year" },
  { key: "target_intake_term", label: "Target Intake Term" },
  { key: "preferred_countries", label: "Preferred Countries" },
  { key: "budget_min", label: "Budget (Min)" },
  { key: "budget_max", label: "Budget (Max)" },
  { key: "funding_plan", label: "Funding Plan" },
  { key: "ielts_toefl_status", label: "IELTS/TOEFL Status" },
  { key: "gre_gmat_status", label: "GRE/GMAT Status" },
  { key: "sop_status", label: "SOP Status" },
] as const;

export function calculateProfileStrength(profile: Profile | null): ProfileStrength {
  if (!profile) {
    return { percentage: 0, completedFields: 0, totalFields: PROFILE_FIELDS.length, missingFields: PROFILE_FIELDS.map(f => f.label) };
  }

  const missingFields: string[] = [];
  let completedFields = 0;

  for (const field of PROFILE_FIELDS) {
    const value = profile[field.key as keyof Profile];
    const isCompleted = value !== null && value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : String(value).trim() !== "");
    
    if (isCompleted) {
      completedFields++;
    } else {
      missingFields.push(field.label);
    }
  }

  const percentage = Math.round((completedFields / PROFILE_FIELDS.length) * 100);

  return { percentage, completedFields, totalFields: PROFILE_FIELDS.length, missingFields };
}

export type AcademicsLevel = "strong" | "moderate" | "weak";
export type ExamsLevel = "ready" | "in_progress" | "missing";
export type BudgetFitLevel = "good" | "tight" | "risky";

export interface ProfileStrengthDetailed {
  academics: AcademicsLevel;
  exams: ExamsLevel;
  budgetFit: BudgetFitLevel;
  overallReadinessScore: number;
}

export function calculateProfileStrengthDetailed(profile: Profile | null): ProfileStrengthDetailed {
  const defaultResult: ProfileStrengthDetailed = {
    academics: "weak",
    exams: "missing",
    budgetFit: "risky",
    overallReadinessScore: 0,
  };
  if (!profile) return defaultResult;

  let academics: AcademicsLevel = "weak";
  const gpa = profile.gpa_percentage != null ? profile.gpa_percentage : null;
  if (gpa != null) {
    if (gpa >= 85 || (gpa <= 4 && gpa >= 3.5)) academics = "strong";
    else if (gpa >= 70 || (gpa <= 4 && gpa >= 3)) academics = "moderate";
  } else if (profile.education_level && profile.degree_major) academics = "moderate";

  const ielts = profile.ielts_toefl_status;
  const gre = profile.gre_gmat_status;
  const ieltsReady = ielts === "taken";
  const greReady = gre === "taken";
  const ieltsMissing = ielts === "not_planned" || !ielts;
  const greMissing = gre === "not_planned" || !gre;
  let exams: ExamsLevel = "missing";
  if (ieltsReady && greReady) exams = "ready";
  else if (ielts === "planned" || gre === "planned" || ieltsReady || greReady) exams = "in_progress";

  const minB = profile.budget_min ?? 0;
  const maxB = profile.budget_max ?? 0;
  const budgetSet = minB > 0 || maxB > 0;
  let budgetFit: BudgetFitLevel = "risky";
  if (budgetSet) {
    const avg = maxB > minB ? (minB + maxB) / 2 : minB || maxB;
    if (avg >= 35000) budgetFit = "good";
    else if (avg >= 20000) budgetFit = "tight";
  }

  const academicsScore = academics === "strong" ? 90 : academics === "moderate" ? 60 : 30;
  const examsScore = exams === "ready" ? 90 : exams === "in_progress" ? 50 : 20;
  const budgetScore = budgetFit === "good" ? 85 : budgetFit === "tight" ? 55 : 35;
  const overallReadinessScore = Math.round(
    (academicsScore * 0.4 + examsScore * 0.35 + budgetScore * 0.25)
  );

  return { academics, exams, budgetFit, overallReadinessScore };
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to profile changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();
        setProfile(data);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refetch = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();
      setProfile(data);
    }
    setLoading(false);
  };

  return { profile, loading, error, refetch, profileStrength: calculateProfileStrength(profile) };
}
